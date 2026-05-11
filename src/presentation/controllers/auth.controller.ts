import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { RegisterUserUseCase } from "@/application/use-cases/users/register-user.use-case";
import { registerSchema } from "@/application/validations/auth.schema";
import { getUserRepository } from "@/infrastructure/repositories/repository-factory";
import { bcryptPasswordHasher } from "@/infrastructure/security/password";
import { checkRateLimit } from "@/infrastructure/security/rate-limit";
import { sanitizeText } from "@/infrastructure/security/sanitize";
import { mockEmailService } from "@/infrastructure/notifications/mock-email.service";
import { apiError, created, ok, validationError } from "@/presentation/http/api-response";

export async function registerController(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const limit = checkRateLimit(`register:${ip}`, 5, 60_000);

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

    await mockEmailService.sendVerificationEmail(user, token);

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

  // A production provider should persist and validate tokens. This demo keeps the endpoint shape ready.
  return ok({ message: "Correo confirmado correctamente." });
}
