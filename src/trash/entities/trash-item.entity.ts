import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TrashItemType } from '../enums/trash-item-type.enum';

@Entity('trash_items')
export class TrashItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({
    type: 'enum',
    enum: TrashItemType,
  })
  item_type: TrashItemType;

  @Column({ type: 'varchar', length: 255 })
  item_id: string;

  @Column({ type: 'varchar', length: 255 })
  item_title: string;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  deleted_at: Date;

  @Column({ type: 'timestamp with time zone' })
  expires_at: Date;
}
