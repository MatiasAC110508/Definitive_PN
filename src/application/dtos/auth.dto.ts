import type { UserRole } from "@/domain/entities/user.entity";

export type RegisterUserDto = {
  name: string;
  email: string;
  phone?: string;
  password: string;
};

export type AuthenticatedUserDto = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified?: string | null;
};
