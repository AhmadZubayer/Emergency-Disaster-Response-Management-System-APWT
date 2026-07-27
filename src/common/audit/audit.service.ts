import { Injectable } from '@nestjs/common';
import { AuditEntity } from '../entities/audit.entity';

@Injectable()
export class AuditService {
  setCreated<T extends AuditEntity>(entity: T, userId?: string | null): T {
    if (userId) {
      entity.created_by = userId;
    }
    return entity;
  }

  setUpdated<T extends AuditEntity>(entity: T, userId?: string | null): T {
    if (userId) {
      entity.updated_by = userId;
    }
    return entity;
  }

  setDeleted<T extends AuditEntity>(entity: T, userId?: string | null): T {
    if (userId) {
      entity.deleted_by = userId;
    }
    return entity;
  }
}
