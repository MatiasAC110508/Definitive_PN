import type { ISODateString } from "@/types/common";

export type AppointmentStatus = "AVAILABLE" | "RESERVED" | "PENDING" | "CANCELLED";

export interface Appointment {
  id: string;
  userId: string;
  serviceId: string;
  startAt: ISODateString;
  endAt: ISODateString;
  durationMinutes: number;
  status: Exclude<AppointmentStatus, "AVAILABLE">;
  notes?: string | null;
  createdAt: ISODateString;
}

export interface AppointmentSlot {
  id: string;
  startAt: ISODateString;
  endAt: ISODateString;
  label: string;
  status: AppointmentStatus;
  serviceId?: string;
}
