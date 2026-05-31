import type { UserRepository } from "@/domain/repositories/user.repository";
import type { PasswordHasher } from "@/services/password-hasher.service";
import type { TokenStore } from "./forgot-password.use-case";

export class ResetPasswordUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenStore: TokenStore,
  ) {}

  async execute(token: string, newPasswordRaw: string): Promise<void> {
    // Verify token
    const storedToken = await this.tokenStore.find(token);

    if (!storedToken || storedToken.expires < new Date()) {
      throw new Error("INVALID_OR_EXPIRED_TOKEN");
    }

    // Delete token so it can't be reused
    await this.tokenStore.delete(token);

    const user = await this.users.findByEmail(storedToken.identifier);

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    const passwordHash = await this.passwordHasher.hash(newPasswordRaw);
    await this.users.update(user.id, { passwordHash });
  }
}
