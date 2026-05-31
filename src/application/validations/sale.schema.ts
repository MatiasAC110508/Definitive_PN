import { z } from "zod";

export const CreateSaleSchema = z.object({
  customerName: z.string().optional().nullable(),
  amount: z.number().positive("El monto debe ser positivo"),
  description: z.string().min(3, "La descripción debe tener al menos 3 caracteres"),
  saleType: z.enum(["SERVICE", "PRODUCT", "PACKAGE", "OTHER"]),
});

export type CreateSaleInput = z.infer<typeof CreateSaleSchema>;
