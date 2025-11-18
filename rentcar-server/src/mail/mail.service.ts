import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('mail.host'),
      port: this.configService.get<number>('mail.port'),
      secure: this.configService.get<number>('mail.port') === 465,
      auth: {
        user: this.configService.get<string>('mail.user'),
        pass: this.configService.get<string>('mail.password'),
      },
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string,
  ): Promise<void> {
    try {
      const from = this.configService.get<string>('mail.from');
      await this.transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });
      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      throw error;
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${this.configService.get('cors.origin')}/verify-email?token=${token}`;
    const html = `
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>Or copy this link: ${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
    `;

    await this.sendEmail(
      email,
      'Verify your email address',
      html,
      `Please verify your email by visiting: ${verificationUrl}`,
    );
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.configService.get('cors.origin')}/reset-password?token=${token}`;
    const html = `
      <h1>Password Reset</h1>
      <p>You requested to reset your password. Click the link below to reset it:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>Or copy this link: ${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    await this.sendEmail(
      email,
      'Reset your password',
      html,
      `Reset your password by visiting: ${resetUrl}`,
    );
  }

  async sendBookingConfirmationEmail(
    email: string,
    bookingDetails: {
      bookingId: string;
      carBrand: string;
      carModel: string;
      startDate: string;
      endDate: string;
      totalPrice: string;
    },
  ): Promise<void> {
    const html = `
      <h1>Booking Confirmed</h1>
      <p>Your booking has been confirmed!</p>
      <ul>
        <li><strong>Booking ID:</strong> ${bookingDetails.bookingId}</li>
        <li><strong>Car:</strong> ${bookingDetails.carBrand} ${bookingDetails.carModel}</li>
        <li><strong>Start Date:</strong> ${bookingDetails.startDate}</li>
        <li><strong>End Date:</strong> ${bookingDetails.endDate}</li>
        <li><strong>Total Price:</strong> $${bookingDetails.totalPrice}</li>
      </ul>
    `;

    await this.sendEmail(
      email,
      'Booking Confirmed',
      html,
      `Your booking ${bookingDetails.bookingId} has been confirmed.`,
    );
  }
}
