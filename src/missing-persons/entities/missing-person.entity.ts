import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum MissingPersonStatus {
  MISSING = 'MISSING',
  FOUND = 'FOUND',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

@Entity('missing_persons')
export class MissingPerson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  reporter_id: string;

  @Column({ type: 'varchar' })
  full_name: string;

  @Column({ type: 'int' })
  age: number;

  @Column({ type: 'varchar' })
  gender: string;

  @Column({ type: 'varchar' })
  last_seen_location: string;

  @Column({ type: 'varchar' })
  last_seen_date: string;

  @Column({ type: 'varchar', nullable: true })
  photo_url: string | null;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar' })
  contact_phone: string;

  @Column({
    type: 'enum',
    enum: MissingPersonStatus,
    default: MissingPersonStatus.MISSING,
  })
  status: MissingPersonStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
