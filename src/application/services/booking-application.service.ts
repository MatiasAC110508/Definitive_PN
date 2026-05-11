import type { Appointment, AppointmentSlot } from "@/domain/entities/appointment.entity";
import type { AppointmentRepository } from "@/domain/repositories/appointment.repository";
import type { ServiceRepository } from "@/domain/repositories/service.repository";
import { CreateAppointmentUseCase } from "@/application/use-cases/appointments/create-appointment.use-case";
import { GetAvailableSlotsUseCase } from "@/application/use-cases/appointments/get-available-slots.use-case";

export class BookingApplicationService {
  private createAppointmentUseCase: CreateAppointmentUseCase;
  private getAvailableSlotsUseCase: GetAvailableSlotsUseCase;

  constructor(
    private appointmentRepository: AppointmentRepository,
    private serviceRepository: ServiceRepository,
  ) {
    this.createAppointmentUseCase = new CreateAppointmentUseCase(
      appointmentRepository,
      serviceRepository,
    );
    this.getAvailableSlotsUseCase = new GetAvailableSlotsUseCase(appointmentRepository);
  }

  async getSlots(date: string, serviceId?: string): Promise<AppointmentSlot[]> {
    return this.getAvailableSlotsUseCase.execute(date, serviceId);
  }

  async book(input: {
    userId: string;
    serviceId: string;
    startAt: string;
    notes?: string;
  }): Promise<Appointment> {
    return this.createAppointmentUseCase.execute(input);
  }

  async getUserAppointments(userId: string): Promise<Appointment[]> {
    return this.appointmentRepository.findByUser(userId);
  }

  async cancelAppointment(id: string): Promise<Appointment | null> {
    return this.appointmentRepository.updateStatus(id, "CANCELLED");
  }
}
