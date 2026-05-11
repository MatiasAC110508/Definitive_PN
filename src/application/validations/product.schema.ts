import { z } from "zod";

export const productQuerySchema = z.object({
  categorySlug: z.enum(["ropa-femenina", "cosmeticos", "belleza"]).optional(),
  query: z.string().trim().max(80).optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(140),
  categorySlug: z.enum(["ropa-femenina", "cosmeticos", "belleza"]),
  description: z.string().min(10).max(500),
  price: z.number().positive(),
  imageUrl: z.string().url(),
  stock: z.number().int().min(0),
});
