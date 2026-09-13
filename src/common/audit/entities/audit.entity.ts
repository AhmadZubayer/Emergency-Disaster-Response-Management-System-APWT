import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum AuditTask {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

@Entity('audit')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: AuditTask,
  })
  task: AuditTask;

  @Column({ type: 'uuid', nullable: true })
  user_id: string | null;

  @Column({ type: 'text', nullable: true })
  details: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
