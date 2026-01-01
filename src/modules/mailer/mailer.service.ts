import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly webhookUrl?: string;
  private readonly apiKey?: string;
  private readonly fromAddress?: string;

  constructor(private readonly configService: ConfigService) {
    this.webhookUrl = this.configService.get<string>(
      'EMAIL_WEBHOOK_URL',
    );
    this.apiKey = this.configService.get<string>('EMAIL_WEBHOOK_API_KEY');
    this.fromAddress = this.configService.get<string>('EMAIL_FROM');

    if (!this.webhookUrl || !this.fromAddress) {
      this.logger.warn(
        'Mailer no configurado. Defina EMAIL_WEBHOOK_URL y EMAIL_FROM.',
      );
    }
  }

  async sendPasswordResetCode(email: string, code: string) {
    if (!this.webhookUrl || !this.fromAddress) {
      throw new ServiceUnavailableException(
        'El servicio de correo no está configurado.',
      );
    }

    const payload = {
      to: email,
      from: this.fromAddress,
      subject: 'Código de recuperación de contraseña',
      text: `Tu código de verificación es: ${code}. Este código vence en pocos minutos.`,
      html: `<p>Tu código de verificación es: <strong>${code}</strong>.</p><p>Este código vence en pocos minutos.</p>`,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      this.logger.error(
        `Fallo al enviar correo de recuperación: ${response.status} ${response.statusText}`,
      );
      throw new ServiceUnavailableException(
        'No se pudo enviar el correo de recuperación.',
      );
    }
  }
}
