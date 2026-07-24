import type { UserRole } from 'src/auth/types/user-roles.type';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', unique: true })
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  photo_url: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', default: 'user' })
  role: UserRole;

  @Column({ type: 'varchar', nullable: true })
  refresh_token: string | null;

  @Column({ type: 'varchar', nullable: true })
  location: string;

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

//   @Column()
//   is_verified: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
