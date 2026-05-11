import type { Appointment, AppointmentSlot } from "@/domain/entities/appointment.entity";

export interface AppointmentRepository {
  findById(id: string): Promise<Appointment | null>;
  findByUser(userId: string): Promise<Appointment[]>;
  findAll(): Promise<Appointment[]>;
  getAvailability(date: string, serviceId?: string): Promise<AppointmentSlot[]>;
  findConflicts(startAt: string, endAt: string): Promise<Appointment[]>;
  create(appointment: Omit<Appointment, "id" | "createdAt">): Promise<Appointment>;
  updateStatus(id: string, status: Appointment["status"]): Promise<Appointment | null>;
  update(id: string, appointment: Partial<Omit<Appointment, "id" | "createdAt">>): Promise<Appointment | null>;
  delete(id: string): Promise<void>;
}
