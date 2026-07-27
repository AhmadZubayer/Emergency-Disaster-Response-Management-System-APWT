import { Users } from 'src/users/entities/users.entity';
import { AuditEntity } from 'src/common/entities/audit.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { VolunteerVerificationStatus } from '../enums/volunteer-status.enum';

@Entity('volunteers')
export class Volunteer extends AuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  user_id: string;

  @OneToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @Column('simple-array')
  skills: string[];

  @Column({ type: 'boolean', default: false })
  available: boolean;

  @Column({
    type: 'enum',
    enum: VolunteerVerificationStatus,
    default: VolunteerVerificationStatus.NOT_APPLIED,
  })
  verification_status: VolunteerVerificationStatus;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  current_latitude: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  current_longitude: number | null;

  @Column({ type: 'boolean', default: false })
  on_duty: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_location_update: Date | null;
}
