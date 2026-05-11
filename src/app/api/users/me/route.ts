import { getUserRepository } from "@/infrastructure/repositories/repository-factory";
import { getCurrentSession } from "@/lib/auth";
import { apiError, ok } from "@/presentation/http/api-response";
import { NextRequest } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    const session = await getCurrentSession();

    if (!session?.user?.id) {
      return apiError("No autorizado.", 401);
    }

    const body = await request.json();
    const repository = getUserRepository();

    // Only allow updating specific fields
    const allowedFields = {
      name: body.name,
      phone: body.phone,
      image: body.image,
    };

    const updatedUser = await repository.update(session.user.id, allowedFields);

    if (!updatedUser) {
      return apiError("Usuario no encontrado.", 404);
    }

    return ok({ user: updatedUser });
  } catch (error: any) {
    console.error("Error updating own profile:", error);
    return apiError("Error interno al actualizar perfil.", 500);
  }
}
