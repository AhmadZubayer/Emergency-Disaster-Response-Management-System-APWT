import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { AuditEntity } from 'src/common/entities/audit.entity';
import { OrganizationVolunteerRequest } from './organization-volunteer-request.entity';
import { Volunteer } from './volunteer.entity';

@Entity('volunteer_organization_joins')
@Unique(['volunteer_id', 'organization_request_id'])
export class VolunteerOrganizationJoin extends AuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  volunteer_id: string;

  @ManyToOne(() => Volunteer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'volunteer_id' })
  volunteer: Volunteer;

  @Column({ type: 'uuid' })
  organization_request_id: string;

  @ManyToOne(() => OrganizationVolunteerRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_request_id' })
  organization_request: OrganizationVolunteerRequest;

  @CreateDateColumn()
  joined_at: Date;
}
