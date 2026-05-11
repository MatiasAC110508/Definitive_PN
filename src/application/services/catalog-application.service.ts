import type { ProductRepository } from "@/domain/repositories/product.repository";
import type { ServiceRepository } from "@/domain/repositories/service.repository";

export class CatalogApplicationService {
  constructor(
    private readonly services: ServiceRepository,
    private readonly products: ProductRepository,
  ) {}

  async getHomeCatalog() {
    const [featuredServices, featuredProducts] = await Promise.all([
      this.services.findFeatured(),
      this.products.findFeatured(),
    ]);

    return { featuredServices, featuredProducts };
  }
}
