import type { User, UserRole } from "@/domain/entities/user.entity";

export type CreateUserInput = {
  name: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  role?: UserRole;
  image?: string;
};

export interface UserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
  markEmailAsVerified(email: string): Promise<User | null>;
  delete(id: string): Promise<void>;
  updateRole(id: string, role: User["role"]): Promise<User>;
  update(id: string, input: Partial<CreateUserInput>): Promise<User>;
}
