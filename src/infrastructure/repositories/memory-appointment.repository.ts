import type { Appointment, AppointmentSlot } from "@/domain/entities/appointment.entity";
import type { AppointmentRepository } from "@/domain/repositories/appointment.repository";
import { AvailabilityService } from "@/domain/services/availability.service";
import { appointments, schedules, services } from "@/infrastructure/mock/perfect-nails-data";
import { formatDateTimeInputInBusinessTime, getDayOfWeekFromDateString } from "@/lib/business-time";

const appointmentState = [...appointments];
const availability = new AvailabilityService();

function parseAppointmentDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("INVALID_APPOINTMENT_DATE");
  }

  return date;
}

function getBusinessDate(value: Date) {
  return formatDateTimeInputInBusinessTime(value).split("T")[0];
}

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
    const dayOfWeek = getDayOfWeekFromDateString(date);
    const schedule = schedules.find((s) => s.dayOfWeek === dayOfWeek);
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
    const start = parseAppointmentDate(startAt);
    const end = parseAppointmentDate(endAt);

    return appointmentState.filter((apt) => {
      return availability.findConflict(start, end, [apt]) !== undefined;
    });
  }

  async create(
    input: Omit<Appointment, "id" | "createdAt"> & { packageSessions?: number },
  ): Promise<Appointment> {
    const service = services.find((item) => item.id === input.serviceId);

    if (!service) {
      throw new Error("SERVICE_NOT_FOUND");
    }

    const startAt = parseAppointmentDate(input.startAt);
    const endAt = parseAppointmentDate(input.endAt);
    const businessDate = getBusinessDate(startAt);
    const dayOfWeek = getDayOfWeekFromDateString(businessDate);
    const schedule = schedules.find((item) => item.dayOfWeek === dayOfWeek && item.isActive) ?? null;

    availability.assertWithinBusinessHours(startAt, endAt, schedule);

    if (availability.findConflict(startAt, endAt, appointmentState)) {
      throw new Error("SLOT_ALREADY_BOOKED");
    }

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
