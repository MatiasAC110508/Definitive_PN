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

    // 2. Validation: Conflict detection (double-booking)
    const conflicts = await this.appointments.findConflicts(
      startAt.toISOString(),
      endAt.toISOString()
    );

    if (conflicts.length > 0) {
      throw new Error("SLOT_ALREADY_BOOKED");
    }

    return this.appointments.create({
      userId,
      serviceId: service.id,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      durationMinutes: service.durationMinutes,
      status: "PENDING",
      notes: input.notes,
    });
  }
}
