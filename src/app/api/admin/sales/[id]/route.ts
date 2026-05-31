import { NextRequest } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { apiError, ok } from "@/presentation/http/api-response";
import { getSaleRepository } from "@/infrastructure/repositories/repository-factory";
import { DeleteSaleUseCase } from "@/application/use-cases/sale/delete-sale.use-case";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();
    if (!session || !["ADMIN", "STAFF"].includes(session.user.role)) return apiError("Unauthorized", 401);

    const useCase = new DeleteSaleUseCase(getSaleRepository());
    await useCase.execute(id);

    return ok({ message: "Venta eliminada correctamente." });
  } catch (error: any) {
    console.error("Error deleting sale:", error);
    return apiError(error?.message || "Error al eliminar la venta.", 500);
  }
}
