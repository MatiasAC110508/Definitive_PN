import { NextRequest } from "next/server";
import { forgotPasswordSchema, resetPasswordSchema } from "@/application/validations/auth.schema";
import { ForgotPasswordUseCase } from "@/application/use-cases/users/forgot-password.use-case";
import { ResetPasswordUseCase } from "@/application/use-cases/users/reset-password.use-case";
import { getUserRepository } from "@/infrastructure/repositories/repository-factory";
import { getEmailService } from "@/infrastructure/notifications/email-factory";
import { getTokenStore } from "@/infrastructure/security/token-store";
import { bcryptPasswordHasher } from "@/infrastructure/security/password";
import { checkRateLimit } from "@/infrastructure/security/rate-limit";
import { apiError, ok, validationError } from "@/presentation/http/api-response";

export async function forgotPasswordController(request: NextRequest) {
  // Rate limits using X-Forwarded-For or a fallback "local" IP.
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const limit = await checkRateLimit(`forgot-password:${ip}`, 3, 60_000); // 3 per minute

  if (limit.error) {
    return apiError("No pudimos validar el límite de intentos. Inténtalo de nuevo.", 503);
  }

  if (!limit.allowed) {
    return apiError("Demasiados intentos. Inténtalo de nuevo más tarde.", 429);
  }

  const body = await request.json();
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  try {
    const useCase = new ForgotPasswordUseCase(
      getUserRepository(),
      getEmailService(),
      getTokenStore(),
    );
    await useCase.execute(parsed.data.email);
    
    // Always return success even if the email doesn't exist to prevent enumeration.
    return ok({ message: "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña." });
  } catch (error) {
    console.error("Error in forgotPasswordController:", error);
    return apiError("Ocurrió un error al procesar tu solicitud.", 500);
  }
}

export async function resetPasswordController(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const limit = await checkRateLimit(`reset-password:${ip}`, 5, 60_000); 

  if (limit.error) {
    return apiError("No pudimos validar el límite de intentos. Inténtalo de nuevo.", 503);
  }

  if (!limit.allowed) {
    return apiError("Demasiados intentos. Inténtalo de nuevo más tarde.", 429);
  }

  const body = await request.json();
  const parsed = resetPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  try {
    const useCase = new ResetPasswordUseCase(
      getUserRepository(),
      bcryptPasswordHasher,
      getTokenStore(),
    );
    await useCase.execute(parsed.data.token, parsed.data.password);
    
    return ok({ message: "Contraseña actualizada correctamente. Ya puedes iniciar sesión." });
  } catch (error) {
    const err = error as Error;
    if (err.message === "INVALID_OR_EXPIRED_TOKEN") {
      return apiError("El enlace de recuperación es inválido o ha expirado.", 400);
    }
    if (err.message === "USER_NOT_FOUND") {
      return apiError("No se pudo encontrar el usuario asociado al token.", 404);
    }
    console.error("Error in resetPasswordController:", error);
    return apiError("No pudimos actualizar la contraseña en este momento.", 500);
  }
}
