import { Users } from 'src/users/entities/users.entity';
import { AuditEntity } from 'src/common/entities/audit.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrganizationRequestStatus } from '../enums/volunteer-status.enum';

@Entity('organization_volunteer_requests')
export class OrganizationVolunteerRequest extends AuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organization_user_id: string;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_user_id' })
  organization_user: Users;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column('simple-array')
  required_skills: string[];

  @Column({ type: 'varchar' })
  location: string;

  @Column({ type: 'int', default: 1 })
  needed_volunteers: number;

  @Column({
    type: 'enum',
    enum: OrganizationRequestStatus,
    default: OrganizationRequestStatus.OPEN,
  })
  status: OrganizationRequestStatus;
}
