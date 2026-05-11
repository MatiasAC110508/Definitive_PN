import bcrypt from "bcryptjs";
import type { PasswordHasher } from "@/services/password-hasher.service";

export const bcryptPasswordHasher: PasswordHasher = {
  hash(password: string) {
    return bcrypt.hash(password, 12);
  },
  verify(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  },
};
