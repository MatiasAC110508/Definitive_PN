import type { TokenStore } from "@/application/use-cases/users/forgot-password.use-case";
import { getPrismaClient, hasDatabaseConnectionString } from "@/infrastructure/database/prisma";

// In-memory fallback for password reset tokens when no DB is available
const memoryTokens = new Map<string, { identifier: string; token: string; expires: Date }>();

class PrismaTokenStore implements TokenStore {
  async save(identifier: string, token: string, expires: Date): Promise<void> {
    const prisma = getPrismaClient();
    await prisma.verificationToken.create({
      data: { identifier, token, expires },
    });
  }

  async find(token: string): Promise<{ identifier: string; expires: Date } | null> {
    const prisma = getPrismaClient();
    const record = await prisma.verificationToken.findUnique({ where: { token } });
    if (!record) return null;
    return { identifier: record.identifier, expires: record.expires };
  }

  async delete(token: string): Promise<void> {
    const prisma = getPrismaClient();
    await prisma.verificationToken.delete({ where: { token } });
  }
}

class MemoryTokenStore implements TokenStore {
  async save(identifier: string, token: string, expires: Date): Promise<void> {
    memoryTokens.set(token, { identifier, token, expires });
  }

  async find(token: string): Promise<{ identifier: string; expires: Date } | null> {
    const mem = memoryTokens.get(token);
    if (!mem) return null;
    return { identifier: mem.identifier, expires: mem.expires };
  }

  async delete(token: string): Promise<void> {
    memoryTokens.delete(token);
  }
}

export function getTokenStore(): TokenStore {
  return hasDatabaseConnectionString() ? new PrismaTokenStore() : new MemoryTokenStore();
}
