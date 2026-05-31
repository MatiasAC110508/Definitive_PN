import { NextRequest } from "next/server";
import { ListProductsUseCase } from "@/application/use-cases/products/list-products.use-case";
import { ListServicesUseCase } from "@/application/use-cases/services/list-services.use-case";
import { productQuerySchema } from "@/application/validations/product.schema";
import { getProductRepository, getServiceRepository } from "@/infrastructure/repositories/repository-factory";
import { apiError, ok, validationError } from "@/presentation/http/api-response";


export async function listServicesController() {
  const useCase = new ListServicesUseCase(getServiceRepository());
  return ok({ services: await useCase.execute() });
}

export async function listProductsController(request: NextRequest) {
  const query = {
    categorySlug: request.nextUrl.searchParams.get("categorySlug") ?? undefined,
    query: request.nextUrl.searchParams.get("query") ?? undefined,
  };
  const parsed = productQuerySchema.safeParse(query);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const useCase = new ListProductsUseCase(getProductRepository());
  return ok({ products: await useCase.execute(parsed.data) });
}


