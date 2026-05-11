import type { Appointment, AppointmentSlot } from "@/domain/entities/appointment.entity";
import type { AppointmentRepository } from "@/domain/repositories/appointment.repository";
import { AvailabilityService } from "@/domain/services/availability.service";
import { getPrismaClient } from "@/infrastructure/database/prisma";

const availability = new AvailabilityService();

function toAppointment(record: {
  id: string;
  userId: string;
  serviceId: string;
  startAt: Date;
  endAt: Date;
  durationMinutes: number;
  status: string;
  notes: string | null;
  createdAt: Date;
}): Appointment {
  return {
    id: record.id,
    userId: record.userId,
    serviceId: record.serviceId,
    startAt: record.startAt.toISOString(),
    endAt: record.endAt.toISOString(),
    durationMinutes: record.durationMinutes,
    status: record.status as Appointment["status"],
    notes: record.notes,
    createdAt: record.createdAt.toISOString(),
  };
}

export class PrismaAppointmentRepository implements AppointmentRepository {
  async findById(id: string): Promise<Appointment | null> {
    const prisma = getPrismaClient();
    const record = await prisma.appointment.findUnique({
      where: { id },
    });
    return record ? toAppointment(record) : null;
  }

  async findByUser(userId: string): Promise<Appointment[]> {
    const prisma = getPrismaClient();
    const records = await prisma.appointment.findMany({
      where: { userId },
      orderBy: { startAt: "desc" },
    });

    return records.map(toAppointment);
  }

  async findAll(): Promise<Appointment[]> {
    const prisma = getPrismaClient();
    const records = await prisma.appointment.findMany({ orderBy: { startAt: "desc" } });
    return records.map(toAppointment);
  }

  async getAvailability(date: string, serviceId?: string): Promise<AppointmentSlot[]> {
    const prisma = getPrismaClient();
    const dayStart = new Date(`${date}T00:00:00.000`);
    const dayEnd = new Date(`${date}T23:59:59.999`);
    
    const dayOfWeek = new Date(date).getDay();
    // Normalize JS dayOfWeek (0-6, Sun-Sat) to 1-7 (Mon-Sun) if necessary, 
    // but the mock data uses 1-6 (Mon-Sat).
    const normalizedDay = dayOfWeek === 0 ? 7 : dayOfWeek;

    const [appointments, schedule, service] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          startAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      }),
      prisma.schedule.findFirst({
        where: { dayOfWeek: normalizedDay, isActive: true },
      }),
      serviceId ? prisma.service.findUnique({ where: { id: serviceId } }) : null,
    ]);

    if (!schedule) return [];

    return availability.buildDailySlots(
      date,
      appointments.map(toAppointment),
      {
        id: schedule.id,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        isActive: schedule.isActive,
      },
      service?.durationMinutes ?? 60
    );
  }

  async findConflicts(startAt: string, endAt: string): Promise<Appointment[]> {
    const prisma = getPrismaClient();
    const records = await prisma.appointment.findMany({
      where: {
        status: { not: "CANCELLED" },
        OR: [
          {
            startAt: { lt: new Date(endAt) },
            endAt: { gt: new Date(startAt) },
          },
        ],
      },
    });

    return records.map(toAppointment);
  }

  async create(input: Omit<Appointment, "id" | "createdAt">): Promise<Appointment> {
    const prisma = getPrismaClient();
    const record = await prisma.appointment.create({
      data: {
        userId: input.userId,
        serviceId: input.serviceId,
        startAt: new Date(input.startAt),
        endAt: new Date(input.endAt),
        durationMinutes: input.durationMinutes,
        status: input.status,
        notes: input.notes,
      },
    });

    return toAppointment(record);
  }

  async updateStatus(id: string, status: Appointment["status"]): Promise<Appointment | null> {
    const prisma = getPrismaClient();
    const record = await prisma.appointment.update({
      where: { id },
      data: { status },
    });

    return toAppointment(record);
  }

  async update(id: string, input: Partial<Omit<Appointment, "id" | "createdAt">>): Promise<Appointment | null> {
    const prisma = getPrismaClient();
    const record = await prisma.appointment.update({
      where: { id },
      data: {
        userId: input.userId,
        serviceId: input.serviceId,
        startAt: input.startAt ? new Date(input.startAt) : undefined,
        endAt: input.endAt ? new Date(input.endAt) : undefined,
        durationMinutes: input.durationMinutes,
        status: input.status,
        notes: input.notes,
      },
    });

    return toAppointment(record);
  }

  async delete(id: string): Promise<void> {
    const prisma = getPrismaClient();
    await prisma.appointment.delete({
      where: { id },
    });
  }
}
