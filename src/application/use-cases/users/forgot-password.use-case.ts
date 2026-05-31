import { randomBytes } from "crypto";
import type { UserRepository } from "@/domain/repositories/user.repository";
import type { EmailService } from "@/services/email.service";

/**
 * Token storage abstraction for verification tokens.
 * Keeps the use case free of infrastructure imports.
 */
export interface TokenStore {
  save(identifier: string, token: string, expires: Date): Promise<void>;
  find(token: string): Promise<{ identifier: string; expires: Date } | null>;
  delete(token: string): Promise<void>;
}

export class ForgotPasswordUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly emailService: EmailService,
    private readonly tokenStore: TokenStore,
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.users.findByEmail(email);

    // To prevent email enumeration attacks, do not throw if user not found.
    // Just return silently.
    if (!user) return;

    // Generate secure token
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Store token
    await this.tokenStore.save(email, token, expires);

    await this.emailService.sendPasswordResetEmail(email, token);
  }
}
