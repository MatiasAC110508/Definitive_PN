import type { User } from "@/domain/entities/user.entity";
import type { EmailService } from "@/services/email.service";

export const mockEmailService: EmailService = {
  async sendVerificationEmail(user: User, token: string) {
    // Production can replace this with Resend, Postmark, SendGrid, or SMTP.
    console.info(`[email] Verification for ${user.email}: /api/auth/verify?token=${token}`);
  },
  async sendAppointmentConfirmation(email: string, appointmentId: string) {
    console.info(`[email] Appointment ${appointmentId} confirmation sent to ${email}`);
  },
};
