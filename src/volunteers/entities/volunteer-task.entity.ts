import { RescueRequest } from 'src/rescue-requests/entities/rescue-request.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { VolunteerTaskStatus } from '../enums/volunteer-status.enum';
import { Volunteer } from './volunteer.entity';

@Entity('volunteer_tasks')
@Unique(['volunteer_id', 'rescue_request_id'])
export class VolunteerTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  volunteer_id: string;

  @ManyToOne(() => Volunteer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'volunteer_id' })
  volunteer: Volunteer;

  @Column({ type: 'uuid' })
  rescue_request_id: string;

  @ManyToOne(() => RescueRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rescue_request_id' })
  rescue_request: RescueRequest;

  @Column({
    type: 'enum',
    enum: VolunteerTaskStatus,
  })
  status: VolunteerTaskStatus;

  @Column({ type: 'text', nullable: true })
  progress_note: string | null;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
