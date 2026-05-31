import type { User } from "@/domain/entities/user.entity";
import type { EmailService } from "@/services/email.service";
import * as nodemailer from "nodemailer";
import * as crypto from "crypto";

function generateIcs(startAt: Date, durationMinutes: number, serviceName: string, notes: string = ""): string {
  const endAt = new Date(startAt.getTime() + durationMinutes * 60000);
  
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Perfect Nails//ES
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:${crypto.randomUUID()}
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startAt)}
DTEND:${formatDate(endAt)}
SUMMARY:Cita Perfect Nails: ${serviceName}
DESCRIPTION:Reserva de ${serviceName} en Perfect Nails.\\n\\nNotas: ${notes || "Ninguna especial"}
LOCATION:Calle 31 #55-13, Bello, Antioquia
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT2H
DESCRIPTION:Recordatorio de Cita Perfect Nails
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`;
}

export class NodemailerEmailService implements EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  private getFromAddress() {
    return process.env.SMTP_FROM || '"Perfect Nails" <noreply@perfectnails.com>';
  }

  async sendVerificationEmail(user: User, token: string): Promise<void> {
    const url = `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/verify?token=${token}`;
    
    await this.transporter.sendMail({
      from: this.getFromAddress(),
      to: user.email!,
      subject: "Confirma tu correo electrónico - Perfect Nails",
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>¡Bienvenida a Perfect Nails!</h2>
          <p>Hola ${user.name || "Clienta"},</p>
          <p>Gracias por registrarte. Por favor confirma tu correo electrónico para poder hacer reservas.</p>
          <div style="margin: 30px 0;">
            <a href="${url}" style="background-color: #d4af37; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold;">Confirmar Correo</a>
          </div>
          <p style="font-size: 14px; color: #666;">Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
          <p style="font-size: 14px; word-break: break-all;">${url}</p>
        </div>
      `
    });
  }

  async sendAppointmentConfirmation(
    email: string, 
    appointmentId: string,
    details?: { startAt: string; durationMinutes: number; serviceName: string; userName: string; notes?: string; }
  ): Promise<void> {
    const url = `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"}/panel`;
    const mailOptions: nodemailer.SendMailOptions = {
      from: this.getFromAddress(),
      to: email,
      subject: "💅 ¡Reserva Confirmada! - Perfect Nails",
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8f9fa; padding: 40px 20px; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            <div style="background-color: #1a1a1a; padding: 30px; text-align: center;">
              <h1 style="color: #d4af37; margin: 0; font-size: 28px; font-weight: normal; letter-spacing: 2px;">PERFECT NAILS</h1>
            </div>
            
            <div style="padding: 40px 30px;">
              <h2 style="color: #1a1a1a; margin-top: 0; font-size: 22px;">¡Hola, ${details?.userName || "Hermosa"}!</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #666;">
                Hemos registrado y confirmado tu cita con éxito. Nos hace muy felices poder atenderte en Perfect Nails.
              </p>
              
              <div style="margin: 30px 0; background-color: #fdfbf7; border: 1px solid #f2e6cf; border-radius: 8px; padding: 25px;">
                <h3 style="margin-top: 0; color: #d4af37; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Detalles de la Reserva</h3>
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                  <tr>
                    <td style="padding: 8px 0; color: #888; width: 40%;">Servicio:</td>
                    <td style="padding: 8px 0; font-weight: bold; color: #333;">${details?.serviceName || "Servicio Premium"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #888;">Fecha y Hora:</td>
                    <td style="padding: 8px 0; font-weight: bold; color: #333;">${details ? new Date(details.startAt).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' }) : "Pendiente"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #888;">Ubicación:</td>
                    <td style="padding: 8px 0; font-weight: bold; color: #333;">Calle 31 #55-13, Bello</td>
                  </tr>
                </table>
              </div>

              <p style="font-size: 15px; line-height: 1.6; color: #666;">
                Te adjuntamos una invitación para que agregues esta cita a tu calendario y no la olvides.
              </p>

              <div style="text-align: center; margin: 40px 0;">
                <a href="${url}" style="background-color: #1a1a1a; color: #d4af37; text-decoration: none; padding: 14px 32px; border-radius: 30px; font-weight: bold; font-size: 14px; letter-spacing: 1px; display: inline-block;">VER MI PANEL</a>
              </div>
            </div>
            
            <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                ¿Necesitas reprogramar? Hazlo desde tu panel de usuario con al menos 24hrs de anticipación.
              </p>
            </div>
          </div>
        </div>
      `
    };

    if (details) {
      const icsString = generateIcs(new Date(details.startAt), details.durationMinutes, details.serviceName, details.notes);
      mailOptions.attachments = [
        {
          filename: 'cita_perfect_nails.ics',
          content: icsString,
          contentType: 'text/calendar'
        }
      ];
    }
    
    await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const url = `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"}/restablecer?token=${token}`;
    
    await this.transporter.sendMail({
      from: this.getFromAddress(),
      to: email,
      subject: "Recuperación de Contraseña - Perfect Nails",
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Recuperación de contraseña</h2>
          <p>Hemos recibido una solicitud para cambiar tu contraseña.</p>
          <p>Haz clic en el siguiente enlace para establecer una nueva contraseña. Este enlace expira en 1 hora.</p>
          <div style="margin: 30px 0;">
            <a href="${url}" style="background-color: #d4af37; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold;">Restablecer Contraseña</a>
          </div>
          <p style="font-size: 14px; color: #666;">Si no solicitaste este cambio, puedes ignorar este correo.</p>
          <p style="font-size: 14px; color: #666; word-break: break-all;">Link directo: ${url}</p>
        </div>
      `
    });
  }
}
