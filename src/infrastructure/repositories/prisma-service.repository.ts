import type { BeautyService, ServiceCategorySlug } from "@/domain/entities/service.entity";
import type { ServiceRepository } from "@/domain/repositories/service.repository";
import { getPrismaClient } from "@/infrastructure/database/prisma";

function toService(record: {
  id: string;
  name: string;
  slug: string;
  category: { slug: string };
  description: string;
  price: number;
  durationMinutes: number;
  imageUrl: string;
  isFeatured: boolean;
}): BeautyService {
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    categorySlug: record.category.slug as ServiceCategorySlug,
    description: record.description,
    price: record.price,
    durationMinutes: record.durationMinutes,
    imageUrl: record.imageUrl,
    isFeatured: record.isFeatured,
  };
}

export class PrismaServiceRepository implements ServiceRepository {
  async findAll(): Promise<BeautyService[]> {
    const prisma = getPrismaClient();
    const records = await prisma.service.findMany({
      include: { category: true },
      orderBy: { name: "asc" },
    });
    return records.map(toService);
  }

  async findFeatured(): Promise<BeautyService[]> {
    const prisma = getPrismaClient();
    const records = await prisma.service.findMany({
      where: { isFeatured: true },
      include: { category: true },
      take: 4,
    });
    return records.map(toService);
  }

  async findById(id: string): Promise<BeautyService | null> {
    const prisma = getPrismaClient();
    const record = await prisma.service.findUnique({
      where: { id },
      include: { category: true },
    });
    return record ? toService(record) : null;
  }

  async findByCategory(categorySlug: ServiceCategorySlug): Promise<BeautyService[]> {
    const prisma = getPrismaClient();
    const records = await prisma.service.findMany({
      where: { category: { slug: categorySlug } },
      include: { category: true },
    });
    return records.map(toService);
  }

  async create(data: Omit<BeautyService, "id">): Promise<BeautyService> {
    const prisma = getPrismaClient();
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: data.categorySlug },
    });
    const record = await prisma.service.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        durationMinutes: data.durationMinutes,
        imageUrl: data.imageUrl,
        isFeatured: data.isFeatured ?? false,
        categoryId: category.id,
      },
      include: { category: true },
    });
    return toService(record as unknown as Parameters<typeof toService>[0]);
  }

  async update(id: string, data: Partial<BeautyService>): Promise<BeautyService> {
    const prisma = getPrismaClient();
    let categoryId: string | undefined;
    if (data.categorySlug) {
      const category = await prisma.category.findUniqueOrThrow({
        where: { slug: data.categorySlug },
      });
      categoryId = category.id;
    }
    const record = await prisma.service.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.slug ? { slug: data.slug } : {}),
        ...(data.description ? { description: data.description } : {}),
        ...(data.price !== undefined ? { price: data.price } : {}),
        ...(data.durationMinutes !== undefined ? { durationMinutes: data.durationMinutes } : {}),
        ...(data.imageUrl ? { imageUrl: data.imageUrl } : {}),
        ...(data.isFeatured !== undefined ? { isFeatured: data.isFeatured } : {}),
        ...(categoryId ? { categoryId } : {}),
      } as any,
      include: { category: true },
    });
    return toService(record as unknown as Parameters<typeof toService>[0]);
  }

  async delete(id: string): Promise<void> {
    const prisma = getPrismaClient();
    await prisma.service.delete({ where: { id } });
  }
}
