import type { BeautyService, ServiceCategorySlug } from "@/domain/entities/service.entity";
import type { ServiceRepository } from "@/domain/repositories/service.repository";
import { getPrismaClient } from "@/infrastructure/database/prisma";
import { services as serviceCatalog } from "@/infrastructure/mock/perfect-nails-data";

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
  const catalogService = serviceCatalog.find((service) => service.slug === record.slug);

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
    sessionPackages: catalogService?.sessionPackages,
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
}
