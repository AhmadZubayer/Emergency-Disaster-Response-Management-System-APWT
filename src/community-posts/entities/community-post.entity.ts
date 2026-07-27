import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from 'src/users/entities/users.entity';
import { AuditEntity } from 'src/common/entities/audit.entity';
import { CommunityPostComment } from './community-post-comment.entity';
import { CommunityPostReaction } from './community-post-reaction.entity';
import { CommunityPostReport } from './community-post-report.entity';
import { PostStatus } from '../enums/post-status.enum';

@Entity('community_posts')
export class CommunityPost extends AuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column('simple-array', { nullable: true })
  media_urls: string[];

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.POSTED,
  })
  status: PostStatus;

  @Column({ type: 'uuid' })
  author_id: string;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: Users;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  bumped_at: Date;

  @OneToMany(() => CommunityPostComment, (comment) => comment.post)
  comments: CommunityPostComment[];

  @OneToMany(() => CommunityPostReaction, (reaction) => reaction.post)
  reactions: CommunityPostReaction[];

  @OneToMany(() => CommunityPostReport, (report) => report.post)
  reports: CommunityPostReport[];
}
