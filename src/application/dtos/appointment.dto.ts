import type { AppointmentStatus } from "@/domain/entities/appointment.entity";

export type CreateAppointmentDto = {
  serviceId: string;
  startAt: string;
  sessionNumber?: number;
  notes?: string;
};

export type UpdateAppointmentDto = {
  status?: AppointmentStatus;
  startAt?: string;
};
