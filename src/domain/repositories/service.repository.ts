import type { BeautyService, ServiceCategorySlug } from "@/domain/entities/service.entity";

export interface ServiceRepository {
  findAll(): Promise<BeautyService[]>;
  findFeatured(): Promise<BeautyService[]>;
  findById(id: string): Promise<BeautyService | null>;
  findByCategory(categorySlug: ServiceCategorySlug): Promise<BeautyService[]>;
}
