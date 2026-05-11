import type { User } from "@/domain/entities/user.entity";

export interface EmailService {
  sendVerificationEmail(user: User, token: string): Promise<void>;
  sendAppointmentConfirmation(email: string, appointmentId: string): Promise<void>;
}
