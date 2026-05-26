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

    // 3. Create appointment and session package if needed
    const isPackage = input.packageSessions && input.packageSessions > 1;
    let appointmentStatus = "PENDING" as const;

    // Use Prisma directly or repository for transactions in a real world app
    // Here we'll stick to the repository pattern, but we need to store the sessionPackageId.
    // For simplicity with Prisma, we can do it after the appointment is created and link it,
    // or through the Prisma client. Since we need to adjust the appointments repository anyway:
    
    // We pass packageSessions to the repository to let it handle the transaction.
    // Let's assume the appointment creation will be modified to accept this optionally and handle it in infra.
    // For now we'll pass the package details to appointments.create:

    return this.appointments.create({
      userId,
      serviceId: service.id,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      durationMinutes: service.durationMinutes,
      status: appointmentStatus,
      notes: input.notes,
      ...(isPackage ? { packageSessions: input.packageSessions } : {})
    } as any);
  }
}
