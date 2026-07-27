import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { Users } from 'src/users/entities/users.entity';
import { AuditEntity } from 'src/common/entities/audit.entity';

export enum RescueStatus {
  PENDING = 'PENDING',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  DISPATCHED = 'DISPATCHED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESCUED = 'RESCUED',
  CANCELLED = 'CANCELLED',
}

export enum UrgencyLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Entity('rescue_requests')
export class RescueRequest extends AuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({ type: 'varchar', nullable: true })
  address: string | null;

  @Column({ type: 'int', default: 1 })
  people_count: number;

  @Column({
    type: 'enum',
    enum: UrgencyLevel,
    default: UrgencyLevel.HIGH,
  })
  urgency_level: UrgencyLevel;

  @Column({ type: 'varchar', nullable: true })
  photo_url: string | null;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar' })
  contact_phone: string;

  @Column({ type: 'text', nullable: true })
  medical_notes: string | null;

  @Column({
    type: 'enum',
    enum: RescueStatus,
    default: RescueStatus.PENDING,
  })
  status: RescueStatus;

  @Column({ type: 'varchar', nullable: true })
  assigned_rescuer_id: string | null;
}
