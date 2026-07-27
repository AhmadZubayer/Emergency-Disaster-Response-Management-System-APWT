import { HttpStatus } from '@nestjs/common';
import { BaseDomainException } from './base-domain.exception';

export class ResourceConflictException extends BaseDomainException {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT, 'RESOURCE_CONFLICT');
  }
}
