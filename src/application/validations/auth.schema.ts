import { z } from "zod";

export const userRoleSchema = z.enum(["USER", "ADMIN", "STAFF"]);

const optionalPhoneSchema = z
  .string()
  .trim()
  .min(7, "Ingresa un teléfono válido.")
  .max(24)
  .optional()
  .or(z.literal(""));

export const loginSchema = z.object({
  email: z.string().email("Ingresa un correo válido.").trim().toLowerCase(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Ingresa tu nombre completo.").max(80).trim(),
  phone: optionalPhoneSchema,
});

export const adminCreateUserSchema = z
  .object({
    name: z.string().min(2, "El nombre es obligatorio.").max(80).trim(),
    email: z.string().email("Ingresa un correo válido.").trim().toLowerCase(),
    phone: optionalPhoneSchema,
    role: userRoleSchema.optional(),
  })
  .strict();

export const adminUpdateUserSchema = adminCreateUserSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Envía al menos un campo para actualizar.",
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Ingresa un correo válido.").trim().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, "El token no es válido."),
  password: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres."),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
export type AdminCreateUserSchema = z.infer<typeof adminCreateUserSchema>;
export type AdminUpdateUserSchema = z.infer<typeof adminUpdateUserSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
