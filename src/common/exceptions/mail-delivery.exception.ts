import { HttpStatus } from '@nestjs/common';
import { BaseDomainException } from './base-domain.exception';

export class MailDeliveryException extends BaseDomainException {
  constructor(message: string) {
    super(
      `Failed to send email notification: ${message}`,
      HttpStatus.SERVICE_UNAVAILABLE,
      'MAIL_DELIVERY_ERROR',
    );
  }
}
