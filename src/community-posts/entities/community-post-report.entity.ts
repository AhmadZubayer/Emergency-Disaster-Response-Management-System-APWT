import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditEntity } from 'src/common/entities/audit.entity';
import { CommunityPost } from './community-post.entity';
import { Users } from 'src/users/entities/users.entity';

@Entity('community_post_reports')
export class CommunityPostReport extends AuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  post_id: string;

  @ManyToOne(() => CommunityPost, (post) => post.reports, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post: CommunityPost;

  @Column({ type: 'uuid' })
  reporter_id: string;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporter_id' })
  reporter: Users;

  @Column({ type: 'text' })
  reason: string;
}
