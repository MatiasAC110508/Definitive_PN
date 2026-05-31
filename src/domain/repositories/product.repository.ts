import type { Product, ProductCategorySlug } from "@/domain/entities/product.entity";

export type ProductFilters = {
  categorySlug?: ProductCategorySlug;
  query?: string;
};

export interface ProductRepository {
  findAll(filters?: ProductFilters): Promise<Product[]>;
  findFeatured(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  create(data: Omit<Product, "id">): Promise<Product>;
  update(id: string, data: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<void>;
}
