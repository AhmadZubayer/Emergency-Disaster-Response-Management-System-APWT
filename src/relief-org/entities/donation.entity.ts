import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Users } from 'src/users/entities/users.entity';
import { ReliefOrg } from './relief-org.entity';

export enum DonationMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  MOBILE_BANKING = 'mobile_banking',
}

export enum DonationStatus {
  PENDING = 'pending',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}

@Entity('donations')
export class Donation {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // donor → real Users entity from teammate
  @ManyToOne(() => Users, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'donor_id' })
  donor: Users;

  @ApiProperty()
  @Column({ name: 'donor_id' })
  donorId: string;

  @ApiProperty({ example: 5000.00 })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @ApiProperty({ enum: DonationMethod })
  @Column({ type: 'enum', enum: DonationMethod })
  method: DonationMethod;

  @ApiProperty({ required: false })
  @Column({ name: 'transaction_ref', nullable: true })
  transactionRef: string;

  @ApiProperty({ enum: DonationStatus })
  @Column({ type: 'enum', enum: DonationStatus, default: DonationStatus.PENDING })
  status: DonationStatus;

  @ManyToOne(() => ReliefOrg, (org) => org.donations, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'received_by' })
  receivedBy: ReliefOrg;

  @ApiProperty()
  @Column({ name: 'received_by' })
  receivedById: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
