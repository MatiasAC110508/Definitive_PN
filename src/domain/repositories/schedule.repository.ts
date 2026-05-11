import type { Schedule } from "@/domain/entities/schedule.entity";

export interface ScheduleRepository {
  findAll(): Promise<Schedule[]>;
  findByDay(dayOfWeek: number): Promise<Schedule | null>;
  update(schedule: Schedule): Promise<Schedule>;
}
