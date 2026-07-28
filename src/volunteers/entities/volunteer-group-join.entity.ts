import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AuditEntity } from 'src/common/entities/audit.entity';
import { Volunteer } from './volunteer.entity';
import { GroupJoinStatus, GroupTargetType } from '../enums/volunteer-status.enum';

@Entity('volunteer_group_joins')
export class VolunteerGroupJoin extends AuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  volunteer_id: string;

  @ManyToOne(() => Volunteer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'volunteer_id' })
  volunteer: Volunteer;

  @Column({ type: 'enum', enum: GroupTargetType })
  target_type: GroupTargetType;

  @Column({ type: 'uuid' })
  target_id: string;

  @Column({ type: 'text', nullable: false })
  why_join: string;

  @Column({
    type: 'enum',
    enum: GroupJoinStatus,
    default: GroupJoinStatus.PENDING,
  })
  status: GroupJoinStatus;
}
