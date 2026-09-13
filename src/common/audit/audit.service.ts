import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditTask } from './entities/audit.entity';
import { AuditEntity } from '../entities/audit.entity';

export { AuditLog, AuditTask };

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async logAudit(
    task: AuditTask,
    userId?: string | null,
    details?: string | null,
  ): Promise<AuditLog> {
    const auditEntry = this.auditRepo.create({
      task,
      user_id: userId ?? null,
      details: details ?? null,
    });
    return await this.auditRepo.save(auditEntry);
  }

  setCreated<T extends AuditEntity>(entity: T, userId?: string | null): T {
    if (userId) {
      entity.created_by = userId;
    }
    this.logAudit(AuditTask.CREATE, userId, `Created entity ${entity.constructor?.name ?? 'Record'}`).catch(() => {});
    return entity;
  }

  setUpdated<T extends AuditEntity>(entity: T, userId?: string | null): T {
    if (userId) {
      entity.updated_by = userId;
    }
    this.logAudit(AuditTask.UPDATE, userId, `Updated entity ${entity.constructor?.name ?? 'Record'}`).catch(() => {});
    return entity;
  }

  setDeleted<T extends AuditEntity>(entity: T, userId?: string | null): T {
    if (userId) {
      entity.deleted_by = userId;
    }
    this.logAudit(AuditTask.DELETE, userId, `Deleted entity ${entity.constructor?.name ?? 'Record'}`).catch(() => {});
    return entity;
  }
}
