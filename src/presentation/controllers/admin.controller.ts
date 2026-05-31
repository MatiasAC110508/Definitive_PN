import { NextRequest } from "next/server";
import { z } from "zod";
import {
  adminCreateAppointmentSchema,
  adminUpdateAppointmentSchema,
} from "@/application/validations/appointment.schema";
import {
  adminCreateUserSchema,
  adminUpdateUserSchema,
  userRoleSchema,
} from "@/application/validations/auth.schema";
import { createProductSchema, updateProductSchema } from "@/application/validations/product.schema";
import { createServiceSchema, updateServiceSchema } from "@/application/validations/service.schema";
import { GetAdminDashboardUseCase } from "@/application/use-cases/admin/get-admin-dashboard.use-case";
import {
  getUserRepository,
  getAppointmentRepository,
  getScheduleRepository,
  getProductRepository,
  getServiceRepository,
  getSaleRepository,
} from "@/infrastructure/repositories/repository-factory";
import { getCurrentSession } from "@/lib/auth";
import { bcryptPasswordHasher } from "@/infrastructure/security/password";
import { randomBytes } from "crypto";
import { apiError, ok, validationError } from "@/presentation/http/api-response";

const scheduleTimeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Usa formato HH:mm válido.");

const updateScheduleSchema = z
  .object({
    id: z.string().optional(),
    dayOfWeek: z.number().int().min(0).max(6).optional(),
    startTime: scheduleTimeSchema.optional(),
    endTime: scheduleTimeSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.startTime !== undefined ||
      value.endTime !== undefined ||
      value.isActive !== undefined,
    { message: "Envía al menos un campo de horario para actualizar." },
  );

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function getMinutesFromTime(time: string) {
  const [hour = 0, minute = 0] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function isValidScheduleWindow(startTime: string, endTime: string) {
  return getMinutesFromTime(startTime) < getMinutesFromTime(endTime);
}

// En admin.controller.ts
export async function adminMetricsController() {
  try {
    const session = await getCurrentSession();
    if (!session || session.user.role !== "ADMIN") {
      return apiError("Unauthorized", 401);
    }

    const useCase = new GetAdminDashboardUseCase(
      getAppointmentRepository(),
      getServiceRepository(),
      getProductRepository(),
      getUserRepository(),
      getSaleRepository(),
    );

    const data = await useCase.execute();
    return ok(data);
  } catch (error) {
    console.error("Error fetching admin metrics:", error);
    return apiError("Error al obtener las métricas.", 500);
  }
}

export async function updateUserRoleController(request: NextRequest, id: string) {
  const session = await getCurrentSession();

  // Strict admin check
  if (!session || session.user.role !== "ADMIN") {
    return apiError("Unauthorized", 401);
  }

  const body = await request.json();
  const parsed = z.object({ role: userRoleSchema }).strict().safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const repository = getUserRepository();
  const user = await repository.updateRole(id, parsed.data.role);

  return ok({ user });
}

export async function deleteUserController(request: NextRequest, id: string) {
  try {
    const session = await getCurrentSession();

    // Strict admin check
    if (!session || session.user.role !== "ADMIN") {
      return apiError("Unauthorized", 401);
    }

    // Prevent admin from deleting themselves
    if (session.user.id === id) {
      return apiError("No puedes eliminar tu propia cuenta de administrador.", 400);
    }

    const repository = getUserRepository();
    await repository.delete(id);

    return ok({ message: "Usuario eliminado correctamente." });
  } catch (error) {
    console.error("Error deleting user:", error);
    return apiError(getErrorMessage(error, "Error interno al eliminar usuario."), 500);
  }
}

export async function createUserController(request: NextRequest) {
  try {
    const session = await getCurrentSession();

    if (!session || session.user.role !== "ADMIN") {
      return apiError("Unauthorized", 401);
    }

    const body = await request.json();
    const parsed = adminCreateUserSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const repository = getUserRepository();
    const existing = await repository.findByEmail(parsed.data.email);

    if (existing) {
      return apiError("El email ya está registrado.", 400);
    }

    const randomPassword = randomBytes(16).toString("hex");
    const passwordHash = await bcryptPasswordHasher.hash(randomPassword);

    const user = await repository.create({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      role: parsed.data.role ?? "USER",
      passwordHash,
    });

    return ok({ user });
  } catch (error) {
    console.error("Error creating user:", error);
    return apiError(getErrorMessage(error, "Error interno al crear usuario."), 500);
  }
}

export async function updateUserController(request: NextRequest, id: string) {
  try {
    const session = await getCurrentSession();

    if (!session || session.user.role !== "ADMIN") {
      return apiError("Unauthorized", 401);
    }

    const body = await request.json();
    const parsed = adminUpdateUserSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const repository = getUserRepository();
    const user = await repository.update(id, parsed.data);

    return ok({ user });
  } catch (error) {
    console.error("Error updating user:", error);
    return apiError(getErrorMessage(error, "Error interno al actualizar usuario."), 500);
  }
}

export async function createAppointmentController(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !["ADMIN", "STAFF"].includes(session.user.role)) return apiError("Unauthorized", 401);

    const body = await request.json();
    const parsed = adminCreateAppointmentSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const repository = getAppointmentRepository();
    const appointment = await repository.create(parsed.data);
    return ok({ appointment });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return apiError(getErrorMessage(error, "Error interno al crear cita."), 500);
  }
}

export async function updateAppointmentController(request: NextRequest, id: string) {
  try {
    const session = await getCurrentSession();
    if (!session || !["ADMIN", "STAFF"].includes(session.user.role)) return apiError("Unauthorized", 401);

    const body = await request.json();
    const parsed = adminUpdateAppointmentSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const repository = getAppointmentRepository();
    const appointment = await repository.update(id, parsed.data);
    return ok({ appointment });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return apiError(getErrorMessage(error, "Error interno al actualizar cita."), 500);
  }
}

export async function deleteAppointmentController(request: NextRequest, id: string) {
  try {
    const session = await getCurrentSession();
    if (!session || !["ADMIN", "STAFF"].includes(session.user.role)) return apiError("Unauthorized", 401);

    const repository = getAppointmentRepository();
    await repository.delete(id);
    return ok({ message: "Cita eliminada correctamente." });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return apiError(getErrorMessage(error, "Error interno al eliminar cita."), 500);
  }
}

export async function updateScheduleController(request: NextRequest, id: string) {
  try {
    const session = await getCurrentSession();
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 401);

    const body = await request.json();
    const parsed = updateScheduleSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const repository = getScheduleRepository();
    const currentSchedules = await repository.findAll();
    const existing = currentSchedules.find((schedule) => schedule.id === id);

    if (!existing) {
      return apiError("No encontramos el horario solicitado.", 404);
    }

    const nextSchedule = {
      ...existing,
      startTime: parsed.data.startTime ?? existing.startTime,
      endTime: parsed.data.endTime ?? existing.endTime,
      isActive: parsed.data.isActive ?? existing.isActive,
    };

    if (!isValidScheduleWindow(nextSchedule.startTime, nextSchedule.endTime)) {
      return apiError("La hora de apertura debe ser anterior al cierre.", 400);
    }

    const schedule = await repository.update(nextSchedule);
    return ok({ schedule });
  } catch (error) {
    console.error("Error updating schedule:", error);
    return apiError(getErrorMessage(error, "Error interno al actualizar horario."), 500);
  }
}

// PRODUCT CONTROLLERS
export async function createProductController(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !["ADMIN", "STAFF"].includes(session.user.role)) return apiError("Unauthorized", 401);

    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const repository = getProductRepository();
    const product = await repository.create({
      ...parsed.data,
      isFeatured: parsed.data.isFeatured ?? false,
    });
    return ok({ product });
  } catch (error) {
    console.error("Error creating product:", error);
    return apiError(getErrorMessage(error, "Error al crear producto."), 500);
  }
}

export async function updateProductController(request: NextRequest, id: string) {
  try {
    const session = await getCurrentSession();
    if (!session || !["ADMIN", "STAFF"].includes(session.user.role)) return apiError("Unauthorized", 401);

    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const repository = getProductRepository();
    const product = await repository.update(id, parsed.data);
    return ok({ product });
  } catch (error) {
    console.error("Error updating product:", error);
    return apiError(getErrorMessage(error, "Error al actualizar producto."), 500);
  }
}

export async function deleteProductController(request: NextRequest, id: string) {
  try {
    const session = await getCurrentSession();
    if (!session || !["ADMIN", "STAFF"].includes(session.user.role)) return apiError("Unauthorized", 401);

    const repository = getProductRepository();
    await repository.delete(id);
    return ok({ message: "Producto eliminado correctamente." });
  } catch (error) {
    console.error("Error deleting product:", error);
    return apiError(getErrorMessage(error, "Error al eliminar producto."), 500);
  }
}

// SERVICE CONTROLLERS
export async function createServiceController(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !["ADMIN", "STAFF"].includes(session.user.role)) return apiError("Unauthorized", 401);

    const body = await request.json();
    const parsed = createServiceSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const repository = getServiceRepository();
    const service = await repository.create({
      ...parsed.data,
      isFeatured: parsed.data.isFeatured ?? false,
    });
    return ok({ service });
  } catch (error) {
    console.error("Error creating service:", error);
    return apiError(getErrorMessage(error, "Error al crear servicio."), 500);
  }
}

export async function updateServiceController(request: NextRequest, id: string) {
  try {
    const session = await getCurrentSession();
    if (!session || !["ADMIN", "STAFF"].includes(session.user.role)) return apiError("Unauthorized", 401);

    const body = await request.json();
    const parsed = updateServiceSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const repository = getServiceRepository();
    const service = await repository.update(id, parsed.data);
    return ok({ service });
  } catch (error) {
    console.error("Error updating service:", error);
    return apiError(getErrorMessage(error, "Error al actualizar servicio."), 500);
  }
}

export async function deleteServiceController(request: NextRequest, id: string) {
  try {
    const session = await getCurrentSession();
    if (!session || !["ADMIN", "STAFF"].includes(session.user.role)) return apiError("Unauthorized", 401);

    const repository = getServiceRepository();
    await repository.delete(id);
    return ok({ message: "Servicio eliminado correctamente." });
  } catch (error) {
    console.error("Error deleting service:", error);
    return apiError(getErrorMessage(error, "Error al eliminar servicio."), 500);
  }
}
