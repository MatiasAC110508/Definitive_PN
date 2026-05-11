import type { ProductFilters, ProductRepository } from "@/domain/repositories/product.repository";

export class ListProductsUseCase {
  constructor(private readonly products: ProductRepository) {}

  execute(filters?: ProductFilters) {
    return this.products.findAll(filters);
  }
}
