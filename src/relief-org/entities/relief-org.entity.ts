import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Users } from 'src/users/entities/users.entity';
import { Donation } from './donation.entity';
import { Shelter } from './shelter.entity';

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

@Entity('relief_orgs')
export class ReliefOrg {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ManyToOne → Users (teammate's real entity — no more stub)
  @ManyToOne(() => Users, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @ApiProperty()
  @Column({ name: 'user_id' })
  userId: string;

  @ApiProperty({ example: 'Red Crescent Society Bangladesh' })
  @Column({ name: 'org_name', length: 150 })
  orgName: string;

  @ApiProperty({ enum: VerificationStatus })
  @Column({
    name: 'verification_status',
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  verificationStatus: VerificationStatus;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Donation, (donation) => donation.receivedBy)
  donations: Donation[];

  @OneToMany(() => Shelter, (shelter) => shelter.managedBy)
  shelters: Shelter[];
}
