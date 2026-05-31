import { NextRequest } from "next/server";
import { CreateAppointmentUseCase } from "@/application/use-cases/appointments/create-appointment.use-case";
import { GetAvailabilityUseCase } from "@/application/use-cases/appointments/get-availability.use-case";
import { createAppointmentSchema, updateAppointmentSchema } from "@/application/validations/appointment.schema";
import { getAppointmentRepository, getServiceRepository, getScheduleRepository } from "@/infrastructure/repositories/repository-factory";
import { AvailabilityService } from "@/domain/services/availability.service";
import { getDayOfWeekFromDateString, formatDateTimeInputInBusinessTime } from "@/lib/business-time";
import { checkRateLimit } from "@/infrastructure/security/rate-limit";
import { sanitizeText } from "@/infrastructure/security/sanitize";
import { getCurrentSession } from "@/lib/auth";
import { apiError, created, ok, validationError } from "@/presentation/http/api-response";
import { getEmailService } from "@/infrastructure/notifications/email-factory";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function getCreateAppointmentErrorResponse(error: unknown) {
  if (!(error instanceof Error)) return null;

  switch (error.message) {
    case "SERVICE_NOT_FOUND":
      return { message: "El servicio seleccionado no existe.", status: 404 };
    case "PAST_DATE_NOT_ALLOWED":
      return { message: "No puedes reservar una fecha pasada.", status: 400 };
    case "INVALID_APPOINTMENT_DATE":
      return { message: "Selecciona un horario válido.", status: 400 };
    case "BUSINESS_CLOSED":
      return { message: "El negocio no está abierto en ese día.", status: 400 };
    case "APPOINTMENT_OUTSIDE_BUSINESS_HOURS":
      return { message: "La reserva debe estar dentro del horario de atención.", status: 400 };
    case "SLOT_ALREADY_BOOKED":
      return { message: "Ese horario ya no está disponible.", status: 409 };
    default:
      return null;
  }
}

export async function listAppointmentsController() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return apiError("Debes iniciar sesión para ver tus citas.", 401);
  }

  const repository = getAppointmentRepository();
  const appointments =
    ["ADMIN", "STAFF"].includes(session.user.role)
      ? await repository.findAll()
      : await repository.findByUser(session.user.id);

  return ok({ appointments });
}

export async function availabilityController(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const serviceId = request.nextUrl.searchParams.get("serviceId") ?? undefined;
  const useCase = new GetAvailabilityUseCase(getAppointmentRepository());

  return ok({ slots: await useCase.execute(date, serviceId) });
}

export async function createAppointmentController(request: NextRequest) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return apiError("Para reservar debes crear una cuenta o iniciar sesión.", 401);
  }

  const ip = request.headers.get("x-forwarded-for") ?? session.user.id;
  const limit = await checkRateLimit(`appointment:${ip}`, 10, 60_000);

  if (limit.error) {
    return apiError("No pudimos validar el límite de reservas. Inténtalo de nuevo.", 503);
  }

  if (!limit.allowed) {
    return apiError("Demasiadas reservas en poco tiempo. Inténtalo de nuevo.", 429);
  }

  const body = await request.json();
  const parsed = createAppointmentSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  try {
    const useCase = new CreateAppointmentUseCase(
      getAppointmentRepository(),
      getServiceRepository(),
    );

    const appointment = await useCase.execute(session.user.id, {
      serviceId: parsed.data.serviceId,
      startAt: parsed.data.startAt,
      sessionNumber: parsed.data.sessionNumber,
      notes: parsed.data.notes ? sanitizeText(parsed.data.notes) : undefined,
    });

    try {
      if (session.user.email) {
        const serviceRepo = getServiceRepository();
        const serviceData = await serviceRepo.findById(parsed.data.serviceId);
        
        if (serviceData) {
          const emailService = getEmailService();
          // Dispatch async email completely independent of request response
          void emailService.sendAppointmentConfirmation(session.user.email, appointment.id, {
            startAt: appointment.startAt,
            durationMinutes: appointment.durationMinutes,
            serviceName: serviceData.name,
            userName: session.user.name || "Clienta",
            notes: appointment.notes || undefined,
          }).catch(err => console.error("Error background sending email", err));
        }
      }
    } catch (e) {
      console.error("Error setting up email dispatch:", e);
    }

    return created({ appointment });
  } catch (error) {
    const expectedError = getCreateAppointmentErrorResponse(error);

    if (expectedError) {
      return apiError(expectedError.message, expectedError.status);
    }

    console.error("Error creating appointment:", error);
    return apiError("No pudimos crear la reserva.", 500);
  }
}

export async function updateAppointmentController(request: NextRequest, id: string) {
  try {
    const session = await getCurrentSession();

    if (!session?.user?.id) {
      return apiError("Debes iniciar sesión para modificar una cita.", 401);
    }

    const body = await request.json();
    const parsed = updateAppointmentSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const repository = getAppointmentRepository();
    const existing = await repository.findById(id);

    if (!existing) {
      return apiError("No encontramos la cita solicitada.", 404);
    }

    if (!["ADMIN", "STAFF"].includes(session.user.role) && existing.userId !== session.user.id) {
      return apiError("No tienes permisos para modificar esta cita.", 403);
    }

    // Handle re-scheduling (startAt update)
    if (parsed.data.startAt) {
      const startAt = new Date(parsed.data.startAt);
      const endAt = new Date(startAt.getTime() + existing.durationMinutes * 60000);

      // Cannot reschedule to the past
      if (startAt.getTime() < Date.now()) {
        return apiError("No puedes reagendar a una fecha pasada.", 400);
      }

      // Validate business hours
      const businessDate = formatDateTimeInputInBusinessTime(startAt).split("T")[0];
      const dayOfWeek = getDayOfWeekFromDateString(businessDate);
      const scheduleRepo = getScheduleRepository();
      const schedule = await scheduleRepo.findByDay(dayOfWeek);

      const availabilityService = new AvailabilityService();
      try {
        availabilityService.assertWithinBusinessHours(startAt, endAt, schedule);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg === "BUSINESS_CLOSED") {
          return apiError("El negocio no está abierto en ese día.", 400);
        }
        return apiError("La reserva debe estar dentro del horario de atención.", 400);
      }

      // Check for conflicts (excluding the current appointment)
      const conflicts = await repository.findConflicts(startAt.toISOString(), endAt.toISOString());
      const realConflict = conflicts.find((c) => c.id !== id);
      if (realConflict) {
        return apiError("Ese horario ya no está disponible.", 409);
      }

      const appointment = await repository.update(id, {
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
      });
      return ok({ appointment });
    }

    // Handle status update
    if (parsed.data.status) {
      const appointment = await repository.updateStatus(id, parsed.data.status);
      return ok({ appointment });
    }

    return apiError("No se proporcionaron cambios.", 400);
  } catch (error) {
    console.error("Error updating appointment:", error);
    return apiError(getErrorMessage(error, "Error interno al actualizar cita."), 500);
  }
}

export async function deleteAppointmentController(request: NextRequest, id: string) {
  try {
    const session = await getCurrentSession();

    if (!session?.user?.id) {
      return apiError("Debes iniciar sesión para realizar esta acción.", 401);
    }

    const repository = getAppointmentRepository();
    const existing = await repository.findById(id);

    if (!existing) {
      return apiError("No encontramos el registro.", 404);
    }

    if (!["ADMIN", "STAFF"].includes(session.user.role)) {
      if (existing.userId !== session.user.id) {
        return apiError("No tienes permisos.", 403);
      }
      if (existing.status !== "CANCELLED") {
        return apiError("Solo puedes eliminar citas canceladas.", 400);
      }
    }

    await repository.delete(id);
    return ok({ message: "Registro eliminado." });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return apiError(getErrorMessage(error, "Error interno al eliminar registro."), 500);
  }
}
