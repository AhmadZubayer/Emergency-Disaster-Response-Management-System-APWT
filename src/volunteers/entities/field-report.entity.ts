import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditEntity } from 'src/common/entities/audit.entity';
import {
  FieldReportType,
  ReportSeverity,
} from '../enums/volunteer-status.enum';
import { Volunteer } from './volunteer.entity';

@Entity('volunteer_field_reports')
export class FieldReport extends AuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  volunteer_id: string;

  @ManyToOne(() => Volunteer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'volunteer_id' })
  volunteer: Volunteer;

  @Column({
    type: 'enum',
    enum: FieldReportType,
  })
  report_type: FieldReportType;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({ type: 'varchar', nullable: true })
  address: string | null;

  @Column({
    type: 'enum',
    enum: ReportSeverity,
    default: ReportSeverity.MEDIUM,
  })
  severity: ReportSeverity;

  @Column({ type: 'varchar', nullable: true })
  resource_name: string | null;

  @Column({ type: 'int', nullable: true })
  quantity_needed: number | null;
}
