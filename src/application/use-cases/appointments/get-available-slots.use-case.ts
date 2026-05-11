import type { AppointmentSlot } from "@/domain/entities/appointment.entity";
import type { AppointmentRepository } from "@/domain/repositories/appointment.repository";

export class GetAvailableSlotsUseCase {
  constructor(private appointmentRepository: AppointmentRepository) {}

  async execute(date: string, serviceId?: string): Promise<AppointmentSlot[]> {
    return this.appointmentRepository.getAvailability(date, serviceId);
  }
}
