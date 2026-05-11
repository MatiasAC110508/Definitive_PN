import { z } from "zod";

export const createAppointmentSchema = z.object({
  serviceId: z.string().min(1, "Selecciona un servicio."),
  startAt: z.string().datetime("Selecciona un horario válido."),
  notes: z.string().max(400, "Las notas no pueden superar 400 caracteres.").optional(),
});

export const updateAppointmentSchema = z.object({
  status: z.enum(["RESERVED", "PENDING", "CANCELLED"]).optional(),
  startAt: z.string().datetime().optional(),
});

export type CreateAppointmentSchema = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentSchema = z.infer<typeof updateAppointmentSchema>;
