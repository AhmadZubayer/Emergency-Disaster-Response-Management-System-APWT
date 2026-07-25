import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Users } from 'src/users/entities/users.entity';
import { DonationCampaign } from './campaign.entity';
import { DonationApplication } from './application.entity';
import { PaymentGateway, TransactionStatus, TransactionType } from '../enums';

@Entity('donation_transactions')
export class DonationTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  campaign_id: string;

  @ManyToOne(() => DonationCampaign, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaign_id' })
  campaign: DonationCampaign;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  transaction_type: TransactionType;

  @Column({ type: 'uuid', nullable: true })
  user_id: string | null;

  @ManyToOne(() => Users, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: Users | null;

  @Column({ type: 'boolean', default: false })
  is_anonymous: boolean;

  @Column({ type: 'varchar', nullable: true })
  user_name: string | null;

  @Column({ type: 'varchar', nullable: true })
  user_email: string | null;

  @Column({ type: 'uuid', nullable: true })
  application_id: string | null;

  @ManyToOne(() => DonationApplication, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'application_id' })
  application: DonationApplication | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentGateway,
    default: PaymentGateway.STRIPE,
  })
  payment_gateway: PaymentGateway;

  @Column({ type: 'varchar', unique: true })
  transaction_id: string;

  @Column({ type: 'varchar', nullable: true })
  gateway_tx_id: string | null;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ type: 'timestamp', nullable: true })
  paid_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
