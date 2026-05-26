import type { AppointmentStatus } from "@/domain/entities/appointment.entity";

export type CreateAppointmentDto = {
  serviceId: string;
  startAt: string;
  packageSessions?: number;
  notes?: string;
};

export type UpdateAppointmentDto = {
  status?: Exclude<AppointmentStatus, "AVAILABLE">;
  startAt?: string;
};
