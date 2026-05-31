import { randomBytes } from "crypto";
import { getEmailService } from "@/infrastructure/notifications/email-factory";
import { getUserRepository } from "@/infrastructure/repositories/repository-factory";
import { getPrismaClient, hasDatabaseConnectionString } from "@/infrastructure/database/prisma";

// Fallback in-memory store for verification tokens if no DB is available
const memoryTokens = new Map<string, { identifier: string; token: string; expires: Date }>();

export class ForgotPasswordUseCase {
  async execute(email: string): Promise<void> {
    const userRepository = getUserRepository();
    const user = await userRepository.findByEmail(email);

    // To prevent email enumeration attacks, do not throw if user not found.
    // Just return silently.
    if (!user) return;

    // Generate secure token
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Store token
    if (hasDatabaseConnectionString()) {
      const prisma = getPrismaClient();
      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
        },
      });
    } else {
      memoryTokens.set(token, { identifier: email, token, expires });
    }

    const emailService = getEmailService();
    await emailService.sendPasswordResetEmail(email, token);
  }
}

export { memoryTokens };
