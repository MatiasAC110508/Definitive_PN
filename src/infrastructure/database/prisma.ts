import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export function hasDatabaseConnectionString() {
  return Boolean(
    process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("USER:PASSWORD"),
  );
}

export function getPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString || connectionString.includes("USER:PASSWORD")) {
    throw new Error("DATABASE_URL is required to use Prisma repositories.");
  }

  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }

  return prisma;
}
