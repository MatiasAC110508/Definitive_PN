import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Ingresa un correo válido.").trim().toLowerCase(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Ingresa tu nombre completo.").max(80).trim(),
  phone: z.string().min(7, "Ingresa un teléfono válido.").max(24).optional().or(z.literal("")),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
