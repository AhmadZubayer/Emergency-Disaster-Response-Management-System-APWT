import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommunityPost } from './community-post.entity';
import { Users } from 'src/users/entities/users.entity';
import { ReactionType } from '../enums/reaction-type.enum';

@Entity('community_post_reactions')
export class CommunityPostReaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  post_id: string;

  @ManyToOne(() => CommunityPost, (post) => post.reactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post: CommunityPost;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @Column({
    type: 'enum',
    enum: ReactionType,
    default: ReactionType.LIKE,
  })
  type: ReactionType;

  @CreateDateColumn()
  created_at: Date;
}
