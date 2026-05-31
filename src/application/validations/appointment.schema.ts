import { z } from "zod";

const appointmentStatusSchema = z.enum(["PENDING", "PAID", "COMPLETED", "CANCELLED", "NO_SHOW"]);
const appointmentDateSchema = z.string().datetime("Selecciona un horario válido.");
const durationSchema = z.coerce.number().int().min(15).max(480);

function hasAtLeastOneField(value: Record<string, unknown>) {
  return Object.keys(value).length > 0;
}

function addAppointmentWindowIssues(
  value: {
    startAt?: string;
    endAt?: string;
    durationMinutes?: number;
  },
  ctx: z.RefinementCtx,
) {
  if (!value.startAt || !value.endAt) return;

  const startAt = new Date(value.startAt);
  const endAt = new Date(value.endAt);

  if (endAt.getTime() <= startAt.getTime()) {
    ctx.addIssue({
      code: "custom",
      message: "La hora de fin debe ser posterior a la hora de inicio.",
      path: ["endAt"],
    });
    return;
  }

  if (value.durationMinutes === undefined) return;

  const expectedDurationMs = value.durationMinutes * 60_000;
  const actualDurationMs = endAt.getTime() - startAt.getTime();

  if (actualDurationMs !== expectedDurationMs) {
    ctx.addIssue({
      code: "custom",
      message: "La duración no coincide con la hora de inicio y fin.",
      path: ["durationMinutes"],
    });
  }
}

export const createAppointmentSchema = z.object({
  serviceId: z.string().min(1, "Selecciona un servicio."),
  startAt: appointmentDateSchema,
  sessionNumber: z.number().int().min(1).max(24).optional(),
  notes: z.string().max(400, "Las notas no pueden superar 400 caracteres.").optional(),
});

export const updateAppointmentSchema = z.object({
  status: appointmentStatusSchema.optional(),
  startAt: appointmentDateSchema.optional(),
});

export const adminCreateAppointmentSchema = z
  .object({
    userId: z.string().min(1, "Selecciona una clienta."),
    serviceId: z.string().min(1, "Selecciona un servicio."),
    startAt: appointmentDateSchema,
    endAt: appointmentDateSchema,
    durationMinutes: durationSchema,
    status: appointmentStatusSchema,
    notes: z.string().max(400, "Las notas no pueden superar 400 caracteres.").nullable().optional(),
    sessionNumber: z.coerce.number().int().min(1).max(24).optional(),
  })
  .strict()
  .superRefine(addAppointmentWindowIssues);

export const adminUpdateAppointmentSchema = z
  .object({
    userId: z.string().min(1, "Selecciona una clienta.").optional(),
    serviceId: z.string().min(1, "Selecciona un servicio.").optional(),
    startAt: appointmentDateSchema.optional(),
    endAt: appointmentDateSchema.optional(),
    durationMinutes: durationSchema.optional(),
    status: appointmentStatusSchema.optional(),
    notes: z.string().max(400, "Las notas no pueden superar 400 caracteres.").nullable().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (!hasAtLeastOneField(value)) {
      ctx.addIssue({
        code: "custom",
        message: "Envía al menos un campo para actualizar.",
      });
      return;
    }

    const hasSchedulingUpdate =
      value.serviceId !== undefined ||
      value.startAt !== undefined ||
      value.endAt !== undefined ||
      value.durationMinutes !== undefined;

    if (
      hasSchedulingUpdate &&
      (!value.serviceId || !value.startAt || !value.endAt || value.durationMinutes === undefined)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Para cambiar horario o servicio envía serviceId, startAt, endAt y durationMinutes.",
      });
      return;
    }

    addAppointmentWindowIssues(value, ctx);
  });

export type CreateAppointmentSchema = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentSchema = z.infer<typeof updateAppointmentSchema>;
export type AdminCreateAppointmentSchema = z.infer<typeof adminCreateAppointmentSchema>;
export type AdminUpdateAppointmentSchema = z.infer<typeof adminUpdateAppointmentSchema>;
