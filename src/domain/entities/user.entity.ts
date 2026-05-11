import type { ISODateString } from "@/types/common";

export type UserRole = "USER" | "ADMIN" | "STAFF";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  passwordHash?: string | null;
  emailVerified?: ISODateString | null;
  image?: string | null;
  createdAt: ISODateString;
}
