import { HttpStatus } from '@nestjs/common';
import { BaseDomainException } from './base-domain.exception';

export class StripePaymentException extends BaseDomainException {
  constructor(message: string, statusCode: number = HttpStatus.BAD_REQUEST) {
    super(message, statusCode, 'STRIPE_PAYMENT_ERROR');
  }
}
