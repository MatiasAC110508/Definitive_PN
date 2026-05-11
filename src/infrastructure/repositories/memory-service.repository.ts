import type { BeautyService, ServiceCategorySlug } from "@/domain/entities/service.entity";
import type { ServiceRepository } from "@/domain/repositories/service.repository";
import { services } from "@/infrastructure/mock/perfect-nails-data";

export class MemoryServiceRepository implements ServiceRepository {
  async findAll(): Promise<BeautyService[]> {
    return services;
  }

  async findFeatured(): Promise<BeautyService[]> {
    return services.filter((service) => service.isFeatured);
  }

  async findById(id: string): Promise<BeautyService | null> {
    return services.find((service) => service.id === id) ?? null;
  }

  async findByCategory(categorySlug: ServiceCategorySlug): Promise<BeautyService[]> {
    return services.filter((service) => service.categorySlug === categorySlug);
  }
}
