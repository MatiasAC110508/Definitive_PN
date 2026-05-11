import { NextRequest } from "next/server";
import { getUserRepository, getAppointmentRepository, getScheduleRepository } from "@/infrastructure/repositories/repository-factory";
import { getCurrentSession } from "@/lib/auth";
import { apiError, ok } from "@/presentation/http/api-response";

// En admin.controller.ts
export const adminMetricsController = async () => {
  return new Response(JSON.stringify({ message: "Próximamente" }), {
    status: 200,
  });
};

export async function updateUserRoleController(request: NextRequest, id: string) {
  const session = await getCurrentSession();

  // Strict admin check
  if (!session || session.user.role !== "ADMIN") {
    return apiError("Unauthorized", 401);
  }

  const { role } = await request.json();
  
  if (!["USER", "ADMIN", "STAFF"].includes(role)) {
    return apiError("Invalid role", 400);
  }

  const repository = getUserRepository();
  const user = await repository.updateRole(id, role as any);

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
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return apiError(error.message || "Error interno al eliminar usuario.", 500);
  }
}

export async function createUserController(request: NextRequest) {
  try {
    const session = await getCurrentSession();

    if (!session || session.user.role !== "ADMIN") {
      return apiError("Unauthorized", 401);
    }

    const body = await request.json();
    const repository = getUserRepository();

    // Basic validation
    if (!body.email || !body.name) {
      return apiError("Nombre y email son obligatorios.", 400);
    }

    const existing = await repository.findByEmail(body.email);
    if (existing) {
      return apiError("El email ya está registrado.", 400);
    }

    const user = await repository.create({
      name: body.name,
      email: body.email,
      phone: body.phone,
      role: body.role || "USER",
      passwordHash: body.passwordHash || null,
    });

    return ok({ user });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return apiError(error.message || "Error interno al crear usuario.", 500);
  }
}

export async function updateUserController(request: NextRequest, id: string) {
  try {
    const session = await getCurrentSession();

    if (!session || session.user.role !== "ADMIN") {
      return apiError("Unauthorized", 401);
    }

    const body = await request.json();
    const repository = getUserRepository();

    const user = await repository.update(id, body);

    return ok({ user });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return apiError(error.message || "Error interno al actualizar usuario.", 500);
  }
}

export async function createAppointmentController(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 401);

    const body = await request.json();
    const repository = getAppointmentRepository();

    const appointment = await repository.create(body);
    return ok({ appointment });
  } catch (error: any) {
    console.error("Error creating appointment:", error);
    return apiError(error.message || "Error interno al crear cita.", 500);
  }
}

export async function updateAppointmentController(request: NextRequest, id: string) {
  try {
    const session = await getCurrentSession();
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 401);

    const body = await request.json();
    const repository = getAppointmentRepository();

    const appointment = await repository.update(id, body);
    return ok({ appointment });
  } catch (error: any) {
    console.error("Error updating appointment:", error);
    return apiError(error.message || "Error interno al actualizar cita.", 500);
  }
}

export async function deleteAppointmentController(request: NextRequest, id: string) {
  try {
    const session = await getCurrentSession();
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 401);

    const repository = getAppointmentRepository();
    await repository.delete(id);
    return ok({ message: "Cita eliminada correctamente." });
  } catch (error: any) {
    console.error("Error deleting appointment:", error);
    return apiError(error.message || "Error interno al eliminar cita.", 500);
  }
}

export async function updateScheduleController(request: NextRequest, id: string) {
  try {
    const session = await getCurrentSession();
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 401);

    const body = await request.json();
    const repository = getScheduleRepository();

    const schedule = await repository.update({ ...body, id });
    return ok({ schedule });
  } catch (error: any) {
    console.error("Error updating schedule:", error);
    return apiError(error.message || "Error interno al actualizar horario.", 500);
  }
}
