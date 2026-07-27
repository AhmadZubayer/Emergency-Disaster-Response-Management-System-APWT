import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailerService {
  constructor(
    private readonly mailerService: NestMailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendVerificationEmail(
    toEmail: string,
    userName: string,
    token: string,
  ): Promise<void> {
    const baseUrl =
      this.configService.get<string>('APP_URL') || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #1a73e8; text-align: center;">Welcome to EDRMS!</h2>
        <p>Hello <strong>${userName}</strong>,</p>
        <p>Thank you for registering with the Emergency Disaster Response Management System. Please verify your email address to activate your account features.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Email Address</a>
        </div>
        <p style="font-size: 13px; color: #666;">Or copy and paste this link into your browser:</p>
        <p style="font-size: 13px; color: #1a73e8; word-break: break-all;">${verificationUrl}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #888; text-align: center;">This link will expire in 24 hours. If you did not register for an account, please ignore this email.</p>
      </div>
    `;

    await this.mailerService.sendMail({
      to: toEmail,
      subject: 'Verify your EDRMS Account Email',
      html: htmlContent,
    });
  }
}
