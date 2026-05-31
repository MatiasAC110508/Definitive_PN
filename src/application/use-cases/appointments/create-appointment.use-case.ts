import type { CreateAppointmentDto } from "@/application/dtos/appointment.dto";
import type { Appointment } from "@/domain/entities/appointment.entity";
import type { AppointmentRepository } from "@/domain/repositories/appointment.repository";
import type { ServiceRepository } from "@/domain/repositories/service.repository";

export class CreateAppointmentUseCase {
  constructor(
    private readonly appointments: AppointmentRepository,
    private readonly services: ServiceRepository,
  ) {}

  async execute(userId: string, input: CreateAppointmentDto): Promise<Appointment> {
    const service = await this.services.findById(input.serviceId);

    if (!service) {
      throw new Error("SERVICE_NOT_FOUND");
    }

    const startAt = new Date(input.startAt);
    const now = new Date();

    // 1. Validation: No appointments in the past
    if (startAt.getTime() < now.getTime()) {
      throw new Error("PAST_DATE_NOT_ALLOWED");
    }

    const endAt = new Date(startAt.getTime() + service.durationMinutes * 60 * 1000);

    // 2. Create appointment. The repository revalidates business hours and
    // conflicts inside the write path so concurrent requests cannot double-book.
    const appointmentStatus = "PENDING" as const;
    return this.appointments.create({
      userId,
      serviceId: service.id,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      durationMinutes: service.durationMinutes,
      status: appointmentStatus,
      notes: input.notes,
      sessionNumber: input.sessionNumber,
    });
  }
}
