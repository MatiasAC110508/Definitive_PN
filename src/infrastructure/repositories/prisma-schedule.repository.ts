import type { Schedule } from "@/domain/entities/schedule.entity";
import type { ScheduleRepository } from "@/domain/repositories/schedule.repository";
import { getPrismaClient } from "@/infrastructure/database/prisma";

function toSchedule(record: {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): Schedule {
  return {
    id: record.id,
    dayOfWeek: record.dayOfWeek,
    startTime: record.startTime,
    endTime: record.endTime,
    isActive: record.isActive,
  };
}

export class PrismaScheduleRepository implements ScheduleRepository {
  async findAll(): Promise<Schedule[]> {
    const prisma = getPrismaClient();
    const records = await prisma.schedule.findMany({
      orderBy: { dayOfWeek: "asc" },
    });
    return records.map(toSchedule);
  }

  async findByDay(dayOfWeek: number): Promise<Schedule | null> {
    const prisma = getPrismaClient();
    const record = await prisma.schedule.findFirst({
      where: { dayOfWeek, isActive: true },
    });
    return record ? toSchedule(record) : null;
  }

  async update(schedule: Schedule): Promise<Schedule> {
    const prisma = getPrismaClient();
    const record = await prisma.schedule.update({
      where: { id: schedule.id },
      data: {
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        isActive: schedule.isActive,
      },
    });
    return toSchedule(record);
  }
}
