import { NextRequest } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { apiError, ok, validationError } from "@/presentation/http/api-response";
import { CreateSaleSchema } from "@/application/validations/sale.schema";
import { getSaleRepository } from "@/infrastructure/repositories/repository-factory";
import { CreateSaleUseCase } from "@/application/use-cases/sale/create-sale.use-case";
import { GetSalesUseCase } from "@/application/use-cases/sale/get-sales.use-case";

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !["ADMIN", "STAFF"].includes(session.user.role)) return apiError("Unauthorized", 401);

    const useCase = new GetSalesUseCase(getSaleRepository());
    const sales = await useCase.execute();

    return ok({ sales });
  } catch (error: any) {
    console.error("Error fetching sales:", error);
    return apiError(error?.message || "Error al obtener las ventas.", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !["ADMIN", "STAFF"].includes(session.user.role)) return apiError("Unauthorized", 401);

    const body = await request.json();
    const parsed = CreateSaleSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const useCase = new CreateSaleUseCase(getSaleRepository());
    const sale = await useCase.execute(parsed.data);

    return ok({ sale });
  } catch (error: any) {
    console.error("Error creating sale:", error);
    return apiError(error?.message || "Error al registrar la venta.", 500);
  }
}
