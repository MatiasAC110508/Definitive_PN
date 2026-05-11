import { getUserRepository } from "@/infrastructure/repositories/repository-factory";
import { getCurrentSession } from "@/lib/auth";
import { apiError, ok } from "@/presentation/http/api-response";

export async function GET() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return apiError("Debes iniciar sesión para consultar usuarios.", 401);
  }

  if (session.user.role !== "ADMIN") {
    return apiError("No tienes permisos administrativos.", 403);
  }

  return ok({ users: await getUserRepository().findAll() });
}
