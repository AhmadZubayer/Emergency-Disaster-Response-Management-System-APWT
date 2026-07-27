import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from 'src/users/entities/users.entity';
import { AuditEntity } from 'src/common/entities/audit.entity';
import { DonationCampaign } from './campaign.entity';
import { ApplicationStatus } from '../enums';

@Entity('donation_applications')
export class DonationApplication extends AuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  campaign_id: string;

  @ManyToOne(() => DonationCampaign, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaign_id' })
  campaign: DonationCampaign;

  @Column({ type: 'uuid' })
  applicant_id: string;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'applicant_id' })
  applicant: Users;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'text' })
  payout_details: string; // bKash / Nagad / Bank Account details

  @Column({ type: 'varchar', nullable: true })
  proof_document_url: string | null;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  approved_amount: number | null;

  @Column({ type: 'uuid', nullable: true })
  reviewed_by_user_id: string | null;

  @ManyToOne(() => Users, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'reviewed_by_user_id' })
  reviewed_by: Users | null;

  @Column({ type: 'timestamp', nullable: true })
  reviewed_at: Date | null;
}
