import { getUserRepository } from "@/infrastructure/repositories/repository-factory";
import { getPrismaClient, hasDatabaseConnectionString } from "@/infrastructure/database/prisma";
import { memoryTokens } from "./forgot-password.use-case";
import { bcryptPasswordHasher } from "@/infrastructure/security/password";

export class ResetPasswordUseCase {
  async execute(token: string, newPasswordRaw: string): Promise<void> {
    let identifier = "";

    // Verify token
    if (hasDatabaseConnectionString()) {
      const prisma = getPrismaClient();
      const dbToken = await prisma.verificationToken.findUnique({
        where: { token },
      });

      if (!dbToken || dbToken.expires < new Date()) {
        throw new Error("INVALID_OR_EXPIRED_TOKEN");
      }
      
      identifier = dbToken.identifier;
      
      // Delete token so it can't be reused
      await prisma.verificationToken.delete({
        where: { token },
      });
    } else {
      const mem = memoryTokens.get(token);
      if (!mem || mem.expires < new Date()) {
        throw new Error("INVALID_OR_EXPIRED_TOKEN");
      }
      identifier = mem.identifier;
      memoryTokens.delete(token);
    }

    const userRepository = getUserRepository();
    const user = await userRepository.findByEmail(identifier);

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    const passwordHash = await bcryptPasswordHasher.hash(newPasswordRaw);
    await userRepository.update(user.id, { passwordHash });
  }
}
