import { z } from "zod";

export const createServiceSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(140),
  categorySlug: z.enum(["unas-acrilicas", "manicure", "pedicure", "nail-art", "spa-de-unas"]),
  description: z.string().min(10).max(500),
  price: z.number().positive(),
  durationMinutes: z.number().int().min(15).max(240),
  imageUrl: z.string().url(),
});
