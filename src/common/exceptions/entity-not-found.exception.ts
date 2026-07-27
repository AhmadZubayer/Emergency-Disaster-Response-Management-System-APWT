import { HttpStatus } from '@nestjs/common';
import { BaseDomainException } from './base-domain.exception';

export class EntityNotFoundException extends BaseDomainException {
  constructor(entityName: string, identifier?: string | number) {
    const msg = identifier
      ? `${entityName} with ID/identifier '${identifier}' was not found`
      : `${entityName} was not found`;
    super(msg, HttpStatus.NOT_FOUND, 'ENTITY_NOT_FOUND');
  }
}
