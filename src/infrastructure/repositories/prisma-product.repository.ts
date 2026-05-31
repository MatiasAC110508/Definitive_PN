import type { Product, ProductCategorySlug } from "@/domain/entities/product.entity";
import type { ProductFilters, ProductRepository } from "@/domain/repositories/product.repository";
import { getPrismaClient } from "@/infrastructure/database/prisma";

function toProduct(record: {
  id: string;
  name: string;
  slug: string;
  category: { slug: string };
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  isFeatured: boolean;
}): Product {
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    categorySlug: record.category.slug as ProductCategorySlug,
    description: record.description,
    price: record.price,
    imageUrl: record.imageUrl,
    stock: record.stock,
    isFeatured: record.isFeatured,
  };
}

export class PrismaProductRepository implements ProductRepository {
  async findAll(filters?: ProductFilters): Promise<Product[]> {
    const prisma = getPrismaClient();
    const records = await prisma.product.findMany({
      where: {
        category: filters?.categorySlug ? { slug: filters.categorySlug } : undefined,
        OR: filters?.query
          ? [
              { name: { contains: filters.query, mode: "insensitive" } },
              { description: { contains: filters.query, mode: "insensitive" } },
            ]
          : undefined,
      },
      include: { category: true },
      orderBy: { name: "asc" },
    });

    return records.map(toProduct);
  }

  async findFeatured(): Promise<Product[]> {
    const prisma = getPrismaClient();
    const records = await prisma.product.findMany({
      where: { isFeatured: true },
      include: { category: true },
    });

    return records.map(toProduct);
  }

  async findById(id: string): Promise<Product | null> {
    const prisma = getPrismaClient();
    const record = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    return record ? toProduct(record) : null;
  }

  async create(data: Omit<Product, "id">): Promise<Product> {
    const prisma = getPrismaClient();
    const record = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        stock: data.stock,
        isFeatured: data.isFeatured,
        category: { connect: { slug: data.categorySlug } }
      },
      include: { category: true },
    });
    return toProduct(record);
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const prisma = getPrismaClient();
    const record = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        stock: data.stock,
        isFeatured: data.isFeatured,
        category: data.categorySlug ? { connect: { slug: data.categorySlug } } : undefined
      },
      include: { category: true },
    });
    return toProduct(record);
  }

  async delete(id: string): Promise<void> {
    const prisma = getPrismaClient();
    await prisma.product.delete({
      where: { id },
    });
  }
}
