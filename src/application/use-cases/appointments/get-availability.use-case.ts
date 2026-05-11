import type { AppointmentRepository } from "@/domain/repositories/appointment.repository";

export class GetAvailabilityUseCase {
  constructor(private readonly appointments: AppointmentRepository) {}

  execute(date: string, serviceId?: string) {
    return this.appointments.getAvailability(date, serviceId);
  }
}
