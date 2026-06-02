import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import {
  productCategories,
  products,
  reviews,
  schedules,
  serviceCategories,
  services,
} from "../src/infrastructure/mock/perfect-nails-data";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const seedAdminEmail = process.env.SEED_ADMIN_EMAIL?.trim();
  const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD;
  const seedAdminName = process.env.SEED_ADMIN_NAME?.trim() || "Perfect Nails Admin";
  const seedAdminPhone = process.env.SEED_ADMIN_PHONE?.trim() || null;

  if ((seedAdminEmail && !seedAdminPassword) || (!seedAdminEmail && seedAdminPassword)) {
    throw new Error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be provided together.");
  }

  if (seedAdminPassword && seedAdminPassword.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 12 characters long.");
  }

  const existingAdmin = seedAdminEmail
    ? await prisma.user.findUnique({ where: { email: seedAdminEmail } })
    : null;

  const admin =
    seedAdminEmail && seedAdminPassword
      ? await prisma.user.upsert({
          where: { email: seedAdminEmail },
          update: {
            role: "ADMIN",
            emailVerified: new Date(),
            name: seedAdminName,
            phone: seedAdminPhone,
          },
          create: {
            name: seedAdminName,
            email: seedAdminEmail,
            phone: seedAdminPhone,
            role: "ADMIN",
            passwordHash: await bcrypt.hash(seedAdminPassword, 12),
            emailVerified: new Date(),
          },
        })
      : null;

  if (!admin) {
    console.warn("Skipping admin seed. Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to create the initial admin user.");
  } else if (existingAdmin) {
    console.info("Admin seed user already exists; password was left unchanged.");
  }

  const allCategories = [...serviceCategories, ...productCategories];

  for (const category of allCategories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        type: category.type,
        description: category.description,
        imageUrl: category.imageUrl,
      },
      create: {
        name: category.name,
        slug: category.slug,
        type: category.type,
        description: category.description,
        imageUrl: category.imageUrl,
      },
    });
  }

  // Remove services from DB that are no longer in the mock data
  const validSlugs = services.map((s) => s.slug);
  const staleServices = await prisma.service.findMany({
    where: { slug: { notIn: validSlugs } },
    select: { id: true },
  });
  const staleIds = staleServices.map((s) => s.id);

  if (staleIds.length > 0) {
    // Delete dependent records first to avoid FK violations
    await prisma.appointment.deleteMany({ where: { serviceId: { in: staleIds } } });
    await prisma.review.deleteMany({ where: { serviceId: { in: staleIds } } });
    await prisma.service.deleteMany({ where: { id: { in: staleIds } } });
  }

  for (const service of services) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: service.categorySlug },
    });

    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {
        name: service.name,
        description: service.description,
        price: service.price,
        durationMinutes: service.durationMinutes,
        imageUrl: service.imageUrl,
        isFeatured: service.isFeatured,
        categoryId: category.id,
      },
      create: {
        name: service.name,
        slug: service.slug,
        description: service.description,
        price: service.price,
        durationMinutes: service.durationMinutes,
        imageUrl: service.imageUrl,
        isFeatured: service.isFeatured,
        categoryId: category.id,
      },
    });
  }

  for (const product of products) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: product.categorySlug },
    });

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        stock: product.stock,
        isFeatured: product.isFeatured,
        categoryId: category.id,
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        stock: product.stock,
        isFeatured: product.isFeatured,
        categoryId: category.id,
      },
    });
  }

  await prisma.schedule.deleteMany();
  await prisma.schedule.createMany({ data: schedules });

  await prisma.review.deleteMany();
  await prisma.review.createMany({
    data: reviews.map((review) => ({
      rating: review.rating,
      comment: review.comment,
      imageUrl: review.imageUrl,
      isFeatured: review.isFeatured,
      userId: admin?.id ?? null,
    })),
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
