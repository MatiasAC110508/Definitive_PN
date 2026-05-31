import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { RegisterUserUseCase } from "@/application/use-cases/users/register-user.use-case";
import { registerSchema } from "@/application/validations/auth.schema";
import { getUserRepository } from "@/infrastructure/repositories/repository-factory";
import { getPrismaClient, hasDatabaseConnectionString } from "@/infrastructure/database/prisma";
import { bcryptPasswordHasher } from "@/infrastructure/security/password";
import { checkRateLimit } from "@/infrastructure/security/rate-limit";
import { sanitizeText } from "@/infrastructure/security/sanitize";
import { getEmailService } from "@/infrastructure/notifications/email-factory";
import { apiError, created, ok, validationError } from "@/presentation/http/api-response";

// In-memory fallback for email verification tokens when no DB is available
const memoryVerificationTokens = new Map<string, { identifier: string; token: string; expires: Date }>();

export async function registerController(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const limit = await checkRateLimit(`register:${ip}`, 5, 60_000);

  if (limit.error) {
    return apiError("No pudimos validar el límite de intentos. Inténtalo de nuevo.", 503);
  }

  if (!limit.allowed) {
    return apiError("Demasiados intentos. Inténtalo de nuevo en un minuto.", 429);
  }

  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  try {
    const useCase = new RegisterUserUseCase(getUserRepository(), bcryptPasswordHasher);
    const user = await useCase.execute({
      name: sanitizeText(parsed.data.name),
      email: parsed.data.email,
      phone: parsed.data.phone ? sanitizeText(parsed.data.phone) : undefined,
      password: parsed.data.password,
    });
    const token = randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    // Persist the verification token so it can be validated later
    if (hasDatabaseConnectionString()) {
      const prisma = getPrismaClient();
      await prisma.verificationToken.create({
        data: { identifier: user.email, token, expires },
      });
    } else {
      memoryVerificationTokens.set(token, { identifier: user.email, token, expires });
    }

    const emailService = getEmailService();
    await emailService.sendVerificationEmail(user, token);

    return created({
      id: user.id,
      email: user.email,
      message: "Cuenta creada. Revisa tu correo para confirmar tu email.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
      return apiError("Ya existe una cuenta con este correo.", 409);
    }

    return apiError("No pudimos crear la cuenta en este momento.", 500);
  }
}

export async function verifyEmailController(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return apiError("El enlace de verificación no es válido.", 400);
  }

  try {
    let identifier = "";

    if (hasDatabaseConnectionString()) {
      const prisma = getPrismaClient();
      const dbToken = await prisma.verificationToken.findUnique({ where: { token } });

      if (!dbToken || dbToken.expires < new Date()) {
        return apiError("El enlace de verificación ha expirado o no es válido.", 400);
      }

      identifier = dbToken.identifier;

      // Delete token so it can't be reused
      await prisma.verificationToken.delete({ where: { token } });
    } else {
      const mem = memoryVerificationTokens.get(token);

      if (!mem || mem.expires < new Date()) {
        return apiError("El enlace de verificación ha expirado o no es válido.", 400);
      }

      identifier = mem.identifier;
      memoryVerificationTokens.delete(token);
    }

    const userRepository = getUserRepository();
    await userRepository.markEmailAsVerified(identifier);

    return ok({ message: "Correo confirmado correctamente. Ya puedes iniciar sesión." });
  } catch (error) {
    console.error("Error verifying email:", error);
    return apiError("No pudimos verificar tu correo en este momento.", 500);
  }
}
