import { NextRequest } from "next/server";
import { getPrismaClient } from "@/infrastructure/database/prisma";
import { getCurrentSession } from "@/lib/auth";
import { apiError, ok } from "@/presentation/http/api-response";

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();

    if (!session?.user?.id) {
      return apiError("Debes iniciar sesión para ver tus paquetes vacacionales.", 401);
    }

    const prisma = getPrismaClient();
    const packages = await prisma.sessionPackage.findMany({
      where: { userId: session.user.id },
      include: {
        service: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return ok({ packages });
  } catch (error: any) {
    console.error("Error fetching session packages:", error);
    return apiError("Error interno al obtener los paquetes.", 500);
  }
}
