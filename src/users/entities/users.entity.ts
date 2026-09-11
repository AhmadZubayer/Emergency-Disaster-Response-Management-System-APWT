import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Auth } from 'src/auth/entities/auth.entity';
import { AuditEntity } from 'src/common/entities/audit.entity';
import { Address } from './address.entity';

@Entity('users')
export class Users extends AuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  photo_url: string;


  @Column(() => Address, { prefix: '' })
  address: Address;

  @Column({ type: 'decimal', nullable: true })
  gps_lat: number;

  @Column({ type: 'decimal', nullable: true })
  gps_lng: number;

  @Column({ type: 'boolean', nullable: true })
  is_safe: boolean | null;

  @Column({ type: 'text', nullable: true })
  emergency_message: string;

  @Column({ type: 'text', nullable: true })
  medical_information: string;

  @OneToOne(() => Auth, (auth) => auth.user)
  auth: Auth;
}
