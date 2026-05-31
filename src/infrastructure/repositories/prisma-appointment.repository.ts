import { Prisma } from "@prisma/client";
import type { Appointment, AppointmentSlot } from "@/domain/entities/appointment.entity";
import type { AppointmentRepository } from "@/domain/repositories/appointment.repository";
import { AvailabilityService } from "@/domain/services/availability.service";
import { getPrismaClient } from "@/infrastructure/database/prisma";
import {
  addDaysToDateString,
  formatDateTimeInputInBusinessTime,
  getDayOfWeekFromDateString,
  zonedDateTimeToUtc,
} from "@/lib/business-time";

const availability = new AvailabilityService();
const APPOINTMENT_WRITE_CONFLICT_CODE = "P2034";

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

function isPrismaWriteConflict(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === APPOINTMENT_WRITE_CONFLICT_CODE
  );
}

function toAppointment(record: {
  id: string;
  userId: string;
  serviceId: string;
  startAt: Date;
  endAt: Date;
  durationMinutes: number;
  status: string;
  notes: string | null;
  sessionPackageId?: string | null;
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
    sessionPackageId: record.sessionPackageId,
    notes: record.notes,
    createdAt: record.createdAt.toISOString(),
  };
}

function toSchedule(record: {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}) {
  return {
    id: record.id,
    dayOfWeek: record.dayOfWeek,
    startTime: record.startTime,
    endTime: record.endTime,
    isActive: record.isActive,
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
    const dayStart = zonedDateTimeToUtc(date, "00:00");
    const dayEnd = zonedDateTimeToUtc(addDaysToDateString(date, 1), "00:00");
    const dayOfWeek = getDayOfWeekFromDateString(date);

    const [appointments, schedule, service] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          startAt: {
            gte: dayStart,
            lt: dayEnd,
          },
        },
      }),
      prisma.schedule.findFirst({
        where: { dayOfWeek, isActive: true },
      }),
      serviceId ? prisma.service.findUnique({ where: { id: serviceId } }) : null,
    ]);

    if (!schedule) return [];

    return availability.buildDailySlots(
      date,
      appointments.map(toAppointment),
      toSchedule(schedule),
      service?.durationMinutes ?? 60
    );
  }

  async findConflicts(startAt: string, endAt: string): Promise<Appointment[]> {
    const prisma = getPrismaClient();
    const records = await prisma.appointment.findMany({
      where: {
        status: { not: "CANCELLED" },
        startAt: { lt: new Date(endAt) },
        endAt: { gt: new Date(startAt) },
      },
    });

    return records.map(toAppointment);
  }

  async create(input: Omit<Appointment, "id" | "createdAt"> & { packageSessions?: number }): Promise<Appointment> {
    const prisma = getPrismaClient();
    const startAt = parseAppointmentDate(input.startAt);
    const endAt = parseAppointmentDate(input.endAt);
    const businessDate = getBusinessDate(startAt);
    const dayOfWeek = getDayOfWeekFromDateString(businessDate);
    const lockKey = `appointments:${businessDate}`;

    try {
      const result = await prisma.$transaction(
        async (tx) => {
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey})::bigint)`;

          const [service, schedule, conflict] = await Promise.all([
            tx.service.findUnique({ where: { id: input.serviceId } }),
            tx.schedule.findFirst({ where: { dayOfWeek, isActive: true } }),
            tx.appointment.findFirst({
              where: {
                status: { not: "CANCELLED" },
                startAt: { lt: endAt },
                endAt: { gt: startAt },
              },
            }),
          ]);

          if (!service) {
            throw new Error("SERVICE_NOT_FOUND");
          }

          availability.assertWithinBusinessHours(startAt, endAt, schedule ? toSchedule(schedule) : null);

          if (conflict) {
            throw new Error("SLOT_ALREADY_BOOKED");
          }

          const packageSessions = input.packageSessions;

          if (packageSessions && packageSessions > 1) {
            const sessionPackage = await tx.sessionPackage.create({
              data: {
                userId: input.userId,
                serviceId: input.serviceId,
                totalSessions: packageSessions,
                usedSessions: 1,
                pricePerPackage: service.price,
              },
            });

            return tx.appointment.create({
              data: {
                userId: input.userId,
                serviceId: input.serviceId,
                sessionPackageId: sessionPackage.id,
                startAt,
                endAt,
                durationMinutes: input.durationMinutes,
                status: input.status,
                notes: input.notes,
              },
            });
          }

          return tx.appointment.create({
            data: {
              userId: input.userId,
              serviceId: input.serviceId,
              startAt,
              endAt,
              durationMinutes: input.durationMinutes,
              status: input.status,
              notes: input.notes,
            },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );

      return toAppointment(result);
    } catch (error) {
      if (isPrismaWriteConflict(error)) {
        throw new Error("SLOT_ALREADY_BOOKED");
      }

      throw error;
    }
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
