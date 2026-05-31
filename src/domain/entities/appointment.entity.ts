import type { ISODateString } from "@/types/common";

export type AppointmentStatus = "PENDING" | "PAID" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

export interface Appointment {
  id: string;
  userId: string;
  serviceId: string;
  startAt: ISODateString;
  endAt: ISODateString;
  durationMinutes: number;
  status: Exclude<AppointmentStatus, "AVAILABLE">;
  sessionNumber?: number | null;
  notes?: string | null;
  createdAt: ISODateString;
}

export interface AppointmentSlot {
  id: string;
  startAt: ISODateString;
  endAt: ISODateString;
  label: string;
  status: "AVAILABLE" | "RESERVED";
  serviceId?: string;
}
