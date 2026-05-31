import { mockEmailService } from "./mock-email.service";
import { NodemailerEmailService } from "./nodemailer-email.service";
import type { EmailService } from "@/services/email.service";

let emailServiceInstance: EmailService;

export function getEmailService(): EmailService {
  if (emailServiceInstance) {
    return emailServiceInstance;
  }

  const hasSmtpConfig = Boolean(process.env.SMTP_HOST);

  if (hasSmtpConfig) {
    emailServiceInstance = new NodemailerEmailService();
    console.log("[EmailService] Initialized real SMTP Email Provider (Nodemailer)");
  } else {
    emailServiceInstance = mockEmailService;
    console.log("[EmailService] SMTP_HOST not found, defaulting to MockEmailService");
  }

  return emailServiceInstance;
}
