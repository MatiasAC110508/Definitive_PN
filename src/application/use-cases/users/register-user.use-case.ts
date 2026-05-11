import type { RegisterUserDto } from "@/application/dtos/auth.dto";
import type { User } from "@/domain/entities/user.entity";
import type { UserRepository } from "@/domain/repositories/user.repository";
import type { PasswordHasher } from "@/services/password-hasher.service";

/**
 * Application Use Case for registering a new user in the system.
 */
export class RegisterUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasher, // Interface for hashing service
  ) {}

  /**
   * Executes the registration logic.
   * 1. Checks for duplicate email.
   * 2. Hashes the password using BCrypt.
   * 3. Persists the new user in the repository.
   */
  async execute(input: RegisterUserDto): Promise<User> {
    // Ensure the email is not already taken
    const existingUser = await this.users.findByEmail(input.email);

    if (existingUser) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    // Securely hash the password before storage.
    // The implementation (BCrypt) uses salt rounds to protect against rainbow tables.
    const passwordHash = await this.passwordHasher.hash(input.password);

    return this.users.create({
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash,
      role: "USER", // Default role for new registrations
    });
  }
}
