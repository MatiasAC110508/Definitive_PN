import type { User } from "@/domain/entities/user.entity";
import type { CreateUserInput, UserRepository } from "@/domain/repositories/user.repository";
import { users } from "@/infrastructure/mock/perfect-nails-data";

const userState = [...users];

export class MemoryUserRepository implements UserRepository {
  async findAll(): Promise<User[]> {
    return userState;
  }

  async findById(id: string): Promise<User | null> {
    return userState.find((user) => user.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return userState.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const user: User = {
      id: `usr-${crypto.randomUUID()}`,
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      role: input.role ?? "USER",
      passwordHash: input.passwordHash,
      image: input.image,
      emailVerified: null,
      createdAt: new Date().toISOString(),
    };

    userState.push(user);
    return user;
  }

  async markEmailAsVerified(email: string): Promise<User | null> {
    const user = userState.find((item) => item.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return null;
    }

    user.emailVerified = new Date().toISOString();
    return user;
  }

  async delete(id: string): Promise<void> {
    const index = userState.findIndex((u) => u.id === id);
    if (index !== -1) {
      userState.splice(index, 1);
    }
  }

  async updateRole(id: string, role: User["role"]): Promise<User> {
    const user = userState.find((u) => u.id === id);
    if (!user) throw new Error("User not found");
    user.role = role;
    return user;
  }

  async update(id: string, input: Partial<CreateUserInput>): Promise<User> {
    const index = userState.findIndex((u) => u.id === id);
    if (index === -1) throw new Error("User not found");
    
    const existing = userState[index];
    const updated: User = {
      ...existing,
      name: input.name ?? existing.name,
      email: input.email ?? existing.email,
      phone: input.phone !== undefined ? input.phone : existing.phone,
      role: input.role ?? existing.role,
      image: input.image !== undefined ? input.image : existing.image,
      passwordHash: input.passwordHash !== undefined ? input.passwordHash : existing.passwordHash,
    };

    userState[index] = updated;
    return updated;
  }
}
