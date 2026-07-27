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

  async sendDisasterAlertEmail(
    toEmail: string | null,
    disasterName: string,
    impactedLocation: string,
    impactTime: Date,
    disasterType: string,
  ): Promise<void> {
    if (!toEmail) {
      return;
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #d9480f; margin-bottom: 5px;">Disaster Alert</h2>
          <p style="color: #666; font-size: 14px;">Emergency Disaster Response Management System</p>
        </div>
        <p>Hello,</p>
        <p>A new disaster alert has been reported: <strong>${disasterName}</strong>.</p>
        <div style="background-color: #fff4f4; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #ffe3e3;">
          <p style="margin: 4px 0;"><strong>Type:</strong> ${disasterType}</p>
          <p style="margin: 4px 0;"><strong>Location:</strong> ${impactedLocation}</p>
          <p style="margin: 4px 0;"><strong>Impact Time:</strong> ${impactTime.toLocaleString()}</p>
        </div>
        <p>Please stay alert and follow official instructions.</p>
      </div>
    `;

    await this.mailerService.sendMail({
      to: toEmail,
      subject: `Disaster Alert: ${disasterName}`,
      html: htmlContent,
    });
  }

  async sendDonationReceiptEmail(
    toEmail: string,
    donorName: string,
    amount: number,
    campaignTitle: string,
    transactionId: string,
  ): Promise<void> {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #2b8a3e; margin-bottom: 5px;">Thank You for Your Generous Donation!</h2>
          <p style="color: #666; font-size: 14px;">EDRMS Relief & Disaster Management</p>
        </div>
        <p>Dear <strong>${donorName || 'Valued Supporter'}</strong>,</p>
        <p>We have successfully received your donation of <strong>${amount.toLocaleString()} BDT</strong> for the campaign: <strong>${campaignTitle}</strong>.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #e9ecef;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #666;">Transaction Reference:</td>
              <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #333;">${transactionId}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666;">Amount Donated:</td>
              <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #2b8a3e;">${amount.toLocaleString()} BDT</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666;">Campaign:</td>
              <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #333;">${campaignTitle}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666;">Status:</td>
              <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #2b8a3e;">COMPLETED</td>
            </tr>
          </table>
        </div>
        <p style="font-size: 14px; color: #555;">Your contribution directly supports relief efforts and provides emergency assistance to affected individuals.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #888; text-align: center;">Emergency Disaster Response Management System (EDRMS) &copy; 2026</p>
      </div>
    `;

    await this.mailerService.sendMail({
      to: toEmail,
      subject: `Donation Receipt - ${transactionId}`,
      html: htmlContent,
    });
  }

  async sendAidApprovalEmail(
    toEmail: string,
    applicantName: string,
    approvedAmount: number,
    campaignTitle: string,
    payoutDetails: string,
  ): Promise<void> {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1a73e8; margin-bottom: 5px;">Relief Aid Application Approved!</h2>
          <p style="color: #666; font-size: 14px;">EDRMS Disaster Response Grant</p>
        </div>
        <p>Dear <strong>${applicantName}</strong>,</p>
        <p>Your application for emergency financial relief under <strong>${campaignTitle}</strong> has been reviewed and <strong style="color: #2b8a3e;">APPROVED</strong> by the Relief Organization.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #e9ecef;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #666;">Granted Amount:</td>
              <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #1a73e8; font-size: 16px;">${approvedAmount.toLocaleString()} BDT</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666;">Target Campaign:</td>
              <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #333;">${campaignTitle}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #666;">Payout Destination:</td>
              <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #333;">${payoutDetails}</td>
            </tr>
          </table>
        </div>
        <p style="font-size: 14px; color: #555;">The funds are being transferred to your specified payout channel. If you have any questions or require further support, please reach out to your local relief coordinator.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #888; text-align: center;">Emergency Disaster Response Management System (EDRMS) &copy; 2026</p>
      </div>
    `;

    await this.mailerService.sendMail({
      to: toEmail,
      subject: `Relief Aid Approved - ${campaignTitle}`,
      html: htmlContent,
    });
  }
}
