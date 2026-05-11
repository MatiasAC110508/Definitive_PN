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

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const passwordHash = await bcrypt.hash("Perfect123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@perfectnails.co" },
    update: { role: "ADMIN", passwordHash, emailVerified: new Date() },
    create: {
      name: "Admin Perfect",
      email: "admin@perfectnails.co",
      phone: "+57 310 4627014",
      role: "ADMIN",
      passwordHash,
      emailVerified: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { email: "cliente@perfectnails.co" },
    update: { passwordHash, emailVerified: new Date() },
    create: {
      name: "Cliente Perfect",
      email: "cliente@perfectnails.co",
      phone: "+57 300 000 0000",
      role: "USER",
      passwordHash,
      emailVerified: new Date(),
    },
  });

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
      userId: admin.id,
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
