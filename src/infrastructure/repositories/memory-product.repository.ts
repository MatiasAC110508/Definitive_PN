import type { Product } from "@/domain/entities/product.entity";
import type { ProductFilters, ProductRepository } from "@/domain/repositories/product.repository";
import { products } from "@/infrastructure/mock/perfect-nails-data";

export class MemoryProductRepository implements ProductRepository {
  async findAll(filters?: ProductFilters): Promise<Product[]> {
    return products.filter((product) => {
      const matchesCategory = filters?.categorySlug
        ? product.categorySlug === filters.categorySlug
        : true;
      const query = filters?.query?.toLowerCase();
      const matchesQuery = query
        ? `${product.name} ${product.description}`.toLowerCase().includes(query)
        : true;

      return matchesCategory && matchesQuery;
    });
  }

  async findFeatured(): Promise<Product[]> {
    return products.filter((product) => product.isFeatured);
  }

  async findById(id: string): Promise<Product | null> {
    return products.find((product) => product.id === id) ?? null;
  }

  async create(data: Omit<Product, "id">): Promise<Product> {
    const newProduct: Product = {
      ...data,
      id: `prd-${Math.random().toString(36).substring(2, 9)}`,
    };
    products.push(newProduct);
    return newProduct;
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Product not found");
    const updated = { ...products[index], ...data };
    products[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<void> {
    const index = products.findIndex((p) => p.id === id);
    if (index !== -1) {
      products.splice(index, 1);
    }
  }
}
