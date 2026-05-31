import { z } from "zod";

export const productCategorySchema = z.enum(["ropa-femenina", "cosmeticos", "belleza", "accesorios"]);

const productBaseSchema = z.object({
  name: z.string().min(2).max(120).trim(),
  slug: z
    .string()
    .min(2)
    .max(140)
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "El slug solo puede usar minúsculas, números y guiones."),
  categorySlug: productCategorySchema,
  description: z.string().min(10).max(500).trim(),
  price: z.coerce.number().int().positive(),
  imageUrl: z.string().url(),
  stock: z.coerce.number().int().min(0),
  isFeatured: z.boolean().optional(),
});

export const productQuerySchema = z.object({
  categorySlug: productCategorySchema.optional(),
  query: z.string().trim().max(80).optional(),
});

export const createProductSchema = productBaseSchema.strict();

export const updateProductSchema = productBaseSchema
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Envía al menos un campo para actualizar.",
  });

export type CreateProductSchema = z.infer<typeof createProductSchema>;
export type UpdateProductSchema = z.infer<typeof updateProductSchema>;
