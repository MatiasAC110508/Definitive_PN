import type { User } from "@/domain/entities/user.entity";
import type { CreateUserInput, UserRepository } from "@/domain/repositories/user.repository";
import { getPrismaClient } from "@/infrastructure/database/prisma";

function toUser(record: {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  passwordHash: string | null;
  emailVerified: Date | null;
  image: string | null;
  createdAt: Date;
}): User {
  return {
    id: record.id,
    name: record.name ?? "Cliente Perfect Nails",
    email: record.email ?? "",
    phone: record.phone,
    role: record.role as User["role"],
    passwordHash: record.passwordHash,
    emailVerified: record.emailVerified?.toISOString() ?? null,
    image: record.image,
    createdAt: record.createdAt.toISOString(),
  };
}

export class PrismaUserRepository implements UserRepository {
  async findAll(): Promise<User[]> {
    const prisma = getPrismaClient();
    const records = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    return records.map(toUser);
  }

  async findById(id: string): Promise<User | null> {
    const prisma = getPrismaClient();
    const record = await prisma.user.findUnique({ where: { id } });
    return record ? toUser(record) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const prisma = getPrismaClient();
    const record = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    return record ? toUser(record) : null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const prisma = getPrismaClient();
    const record = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        phone: input.phone,
        passwordHash: input.passwordHash,
        role: input.role ?? "USER",
        image: input.image,
      },
    });

    return toUser(record);
  }

  async markEmailAsVerified(email: string): Promise<User | null> {
    const prisma = getPrismaClient();
    const record = await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { emailVerified: new Date() },
    });

    return toUser(record);
  }

  async delete(id: string): Promise<void> {
    const prisma = getPrismaClient();
    await prisma.user.delete({ where: { id } });
  }

  async updateRole(id: string, role: User["role"]): Promise<User> {
    const prisma = getPrismaClient();
    const record = await prisma.user.update({
      where: { id },
      data: { role },
    });
    return toUser(record);
  }

  async update(id: string, input: Partial<CreateUserInput>): Promise<User> {
    const prisma = getPrismaClient();
    const record = await prisma.user.update({
      where: { id },
      data: {
        name: input.name,
        email: input.email?.toLowerCase(),
        phone: input.phone,
        passwordHash: input.passwordHash,
        role: input.role,
        image: input.image,
      },
    });
    return toUser(record);
  }
}
