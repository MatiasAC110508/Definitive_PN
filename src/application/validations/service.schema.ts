import { z } from "zod";

export const serviceCategorySchema = z.enum([
  "unas-acrilicas",
  "manicure",
  "pedicure",
  "nail-art",
  "spa-de-unas",
  "depilacion-laser",
  "hollywood-peeling",
  "unas-premium",
  "masajes",
  "facial-laser",
  "corporal-aparatologia",
  "depilacion-cera",
]);

const serviceBaseSchema = z.object({
  name: z.string().min(2).max(150).trim(),
  slug: z
    .string()
    .min(2)
    .max(180)
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "El slug solo puede usar minúsculas, números y guiones."),
  categorySlug: serviceCategorySchema,
  description: z.string().min(5).max(600).trim(),
  price: z.coerce.number().int().positive(),
  durationMinutes: z.coerce.number().int().positive(),
  imageUrl: z.string().url(),
  isFeatured: z.boolean().optional(),
});

export const createServiceSchema = serviceBaseSchema.strict();

export const updateServiceSchema = serviceBaseSchema
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Envía al menos un campo para actualizar.",
  });

export type CreateServiceSchema = z.infer<typeof createServiceSchema>;
export type UpdateServiceSchema = z.infer<typeof updateServiceSchema>;
