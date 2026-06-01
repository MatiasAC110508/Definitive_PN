import { mockEmailService } from "./mock-email.service";
import { NodemailerEmailService } from "./nodemailer-email.service";
import { ResendEmailService } from "./resend-email.service";
import type { EmailService } from "@/services/email.service";

let emailServiceInstance: EmailService;

export function getEmailService(): EmailService {
  if (emailServiceInstance) {
    return emailServiceInstance;
  }

  const hasResendConfig = Boolean(process.env.RESEND_API_KEY);
  const hasSmtpConfig = Boolean(process.env.SMTP_HOST);

  if (hasResendConfig) {
    emailServiceInstance = new ResendEmailService();
    console.log("[EmailService] Initialized Resend Email Provider");
  } else if (hasSmtpConfig) {
    emailServiceInstance = new NodemailerEmailService();
    console.log("[EmailService] Initialized SMTP Email Provider (Nodemailer)");
  } else {
    emailServiceInstance = mockEmailService;
    console.log("[EmailService] RESEND_API_KEY and SMTP_HOST not found, defaulting to MockEmailService");
  }

  return emailServiceInstance;
}
