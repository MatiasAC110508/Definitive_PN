import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.number().int().min(1, "La calificación debe ser al menos 1.").max(5, "La calificación debe ser máximo 5."),
  comment: z.string().min(10, "El comentario debe tener al menos 10 caracteres.").max(500, "El comentario es muy largo."),
  serviceId: z.string().optional(),
  productId: z.string().optional(),
});
