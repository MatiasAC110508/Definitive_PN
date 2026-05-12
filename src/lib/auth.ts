import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { loginSchema } from "@/application/validations/auth.schema";
import type { UserRole } from "@/domain/entities/user.entity";
import { getPrismaClient, hasDatabaseConnectionString } from "@/infrastructure/database/prisma";
import { getUserRepository } from "@/infrastructure/repositories/repository-factory";
import { bcryptPasswordHasher } from "@/infrastructure/security/password";

export const authOptions: NextAuthOptions = {
  adapter: hasDatabaseConnectionString() ? PrismaAdapter(getPrismaClient()) : undefined,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    newUser: "/registro",
  },
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const user = await getUserRepository().findByEmail(parsed.data.email);

        if (!user?.passwordHash) {
          return null;
        }

        const validPassword = await bcryptPasswordHasher.verify(
          parsed.data.password,
          user.passwordHash,
        );

        if (!validPassword) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user.role ?? "USER") as UserRole;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role ?? "USER") as UserRole;
      }

      return session;
    },
  },
};

export function getCurrentSession() {
  return getServerSession(authOptions);
}
