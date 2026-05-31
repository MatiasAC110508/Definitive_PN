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

  async create(data: Omit<BeautyService, "id">): Promise<BeautyService> {
    const newService: BeautyService = {
      ...data,
      id: `svc-${Math.random().toString(36).substring(2, 9)}`,
    };
    services.push(newService);
    return newService;
  }

  async update(id: string, data: Partial<BeautyService>): Promise<BeautyService> {
    const index = services.findIndex((s) => s.id === id);
    if (index === -1) throw new Error("Servicio no encontrado.");
    const updated = { ...services[index], ...data };
    services[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<void> {
    const index = services.findIndex((s) => s.id === id);
    if (index !== -1) {
      services.splice(index, 1);
    }
  }
}
