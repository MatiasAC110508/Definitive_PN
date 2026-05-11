import type { Schedule } from "@/domain/entities/schedule.entity";
import type { ScheduleRepository } from "@/domain/repositories/schedule.repository";
import { schedules as mockSchedules } from "@/infrastructure/mock/perfect-nails-data";

export class MemoryScheduleRepository implements ScheduleRepository {
  private schedules: Schedule[] = [...mockSchedules];

  async findAll(): Promise<Schedule[]> {
    return this.schedules;
  }

  async findByDay(dayOfWeek: number): Promise<Schedule | null> {
    return this.schedules.find((s) => s.dayOfWeek === dayOfWeek && s.isActive) ?? null;
  }

  async update(schedule: Schedule): Promise<Schedule> {
    const index = this.schedules.findIndex((s) => s.id === schedule.id);
    if (index !== -1) {
      this.schedules[index] = schedule;
    }
    return schedule;
  }
}
