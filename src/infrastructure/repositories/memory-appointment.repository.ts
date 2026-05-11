import type { Appointment, AppointmentSlot } from "@/domain/entities/appointment.entity";
import type { AppointmentRepository } from "@/domain/repositories/appointment.repository";
import { AvailabilityService } from "@/domain/services/availability.service";
import { appointments, schedules, services } from "@/infrastructure/mock/perfect-nails-data";

const appointmentState = [...appointments];
const availability = new AvailabilityService();

export class MemoryAppointmentRepository implements AppointmentRepository {
  async findById(id: string): Promise<Appointment | null> {
    return appointmentState.find((a) => a.id === id) || null;
  }

  async findByUser(userId: string): Promise<Appointment[]> {
    return appointmentState.filter((appointment) => appointment.userId === userId);
  }

  async findAll(): Promise<Appointment[]> {
    return appointmentState;
  }

  async getAvailability(date: string, serviceId?: string): Promise<AppointmentSlot[]> {
    const dayOfWeek = new Date(date).getDay();
    const normalizedDay = dayOfWeek === 0 ? 7 : dayOfWeek;
    const schedule = schedules.find((s) => s.dayOfWeek === normalizedDay);
    const service = services.find((s) => s.id === serviceId);

    if (!schedule) return [];

    return availability.buildDailySlots(
      date,
      appointmentState,
      schedule,
      service?.durationMinutes ?? 60
    );
  }

  async findConflicts(startAt: string, endAt: string): Promise<Appointment[]> {
    const start = new Date(startAt).getTime();
    const end = new Date(endAt).getTime();

    return appointmentState.filter((apt) => {
      if (apt.status === "CANCELLED") return false;
      const aptStart = new Date(apt.startAt).getTime();
      const aptEnd = new Date(apt.endAt).getTime();
      return aptStart < end && aptEnd > start;
    });
  }

  async create(input: Omit<Appointment, "id" | "createdAt">): Promise<Appointment> {
    const appointment: Appointment = {
      ...input,
      id: `apt-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
    };

    appointmentState.push(appointment);
    return appointment;
  }

  async updateStatus(id: string, status: Appointment["status"]): Promise<Appointment | null> {
    const index = appointmentState.findIndex((appointment) => appointment.id === id);

    if (index < 0) {
      return null;
    }

    appointmentState[index] = { ...appointmentState[index], status };
    return appointmentState[index];
  }

  async update(id: string, input: Partial<Omit<Appointment, "id" | "createdAt">>): Promise<Appointment | null> {
    const index = appointmentState.findIndex((a) => a.id === id);
    if (index < 0) return null;

    appointmentState[index] = { ...appointmentState[index], ...input };
    return appointmentState[index];
  }

  async delete(id: string): Promise<void> {
    const index = appointmentState.findIndex((a) => a.id === id);
    if (index !== -1) {
      appointmentState.splice(index, 1);
    }
  }
}
