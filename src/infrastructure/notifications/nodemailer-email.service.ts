import type { User } from "@/domain/entities/user.entity";
import type { EmailService } from "@/services/email.service";
import * as nodemailer from "nodemailer";

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

  async sendAppointmentConfirmation(email: string, appointmentId: string): Promise<void> {
    const url = `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard`;
    
    await this.transporter.sendMail({
      from: this.getFromAddress(),
      to: email,
      subject: "Reserva Confirmada - Perfect Nails",
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>¡Tu reserva está confirmada!</h2>
          <p>Hemos registrado tu cita (ID: ${appointmentId}) correctamente.</p>
          <p>Puedes ver los detalles de tu cita y gestionarla desde tu dashboard.</p>
          <div style="margin: 30px 0;">
            <a href="${url}" style="background-color: #d4af37; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold;">Ir a mi Dashboard</a>
          </div>
          <p>¡Te esperamos!</p>
        </div>
      `
    });
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
