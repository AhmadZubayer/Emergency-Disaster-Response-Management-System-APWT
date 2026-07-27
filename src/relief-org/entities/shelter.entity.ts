import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ReliefOrg } from './relief-org.entity';

export enum ShelterStatus {
  ACTIVE = 'active',
  FULL = 'full',
  CLOSED = 'closed',
}

@Entity('shelters')
export class Shelter {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ReliefOrg, (org) => org.shelters, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'managed_by' })
  managedBy: ReliefOrg;

  @ApiProperty()
  @Column({ name: 'managed_by' })
  managedById: string;

  @ApiProperty({ example: 'Dhaka Central Relief Camp' })
  @Column()
  name: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  location: string;

  @ApiProperty({ required: false })
  @Column({ name: 'photo_url', nullable: true })
  photoUrl: string;

  @ApiProperty({ required: false })
  @Column({ name: 'gps_lat', type: 'decimal', precision: 9, scale: 6, nullable: true })
  gpsLat: number;

  @ApiProperty({ required: false })
  @Column({ name: 'gps_lng', type: 'decimal', precision: 9, scale: 6, nullable: true })
  gpsLng: number;

  @ApiProperty({ example: 500 })
  @Column({ type: 'int' })
  capacity: number;

  @ApiProperty({ example: 0 })
  @Column({ name: 'current_occupancy', type: 'int', default: 0 })
  currentOccupancy: number;

  @ApiProperty({ enum: ShelterStatus })
  @Column({ type: 'enum', enum: ShelterStatus, default: ShelterStatus.ACTIVE })
  status: ShelterStatus;
}
