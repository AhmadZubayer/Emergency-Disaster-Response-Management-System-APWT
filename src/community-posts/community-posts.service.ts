import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CommunityPost } from './entities/community-post.entity';
import { CommunityPostComment } from './entities/community-post-comment.entity';
import { CommunityPostReaction } from './entities/community-post-reaction.entity';
import { CommunityPostReport } from './entities/community-post-report.entity';
import { PostStatus } from './enums/post-status.enum';
import { ReactionType } from './enums/reaction-type.enum';
import { CreateCommunityPostDto } from './dto/create-community-post.dto';
import { UpdateCommunityPostDto } from './dto/update-community-post.dto';
import { UpdatePostStatusDto } from './dto/update-post-status.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ReactPostDto } from './dto/react-post.dto';
import { ReportPostDto } from './dto/report-post.dto';
import { FilesService } from 'src/files/files.service';
import { UsersService } from 'src/users/users.service';
import { Users } from 'src/users/entities/users.entity';

@Injectable()
export class CommunityPostsService {
  constructor(
    @InjectRepository(CommunityPost)
    private readonly postRepo: Repository<CommunityPost>,
    @InjectRepository(CommunityPostComment)
    private readonly commentRepo: Repository<CommunityPostComment>,
    @InjectRepository(CommunityPostReaction)
    private readonly reactionRepo: Repository<CommunityPostReaction>,
    @InjectRepository(CommunityPostReport)
    private readonly reportRepo: Repository<CommunityPostReport>,
    private readonly filesService: FilesService,
    private readonly usersService: UsersService,
  ) {}

  formatPostedBy(user?: Users | null) {
    return {
      name: user?.name || null,
      role: user?.auth?.role || 'user',
      location: user?.address?.city || null,
    };
  }

  formatCommunityResponse(
    reactions: CommunityPostReaction[],
    commentsCount: number,
  ) {
    const reactionCounts = {
      total: reactions ? reactions.length : 0,
      like: 0,
      dislike: 0,
      sad: 0,
      care: 0,
    };

    (reactions || []).forEach((r) => {
      const typeStr = r.type?.toLowerCase();
      if (typeStr === 'like') reactionCounts.like++;
      else if (typeStr === 'dislike') reactionCounts.dislike++;
      else if (typeStr === 'sad') reactionCounts.sad++;
      else if (typeStr === 'care') reactionCounts.care++;
    });

    return {
      Reactions: reactionCounts,
      totalComments: commentsCount,
    };
  }

  searchPost(queryBuilder: SelectQueryBuilder<CommunityPost>, search?: string) {
    if (search) {
      queryBuilder.andWhere(
        '(post.title ILIKE :search OR post.body ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    return queryBuilder;
  }

  sortPost(
    queryBuilder: SelectQueryBuilder<CommunityPost>,
    sort?: 'asc' | 'desc',
  ) {
    if (sort) {
      const order = sort.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
      queryBuilder.orderBy('post.created_at', order);
    }
    return queryBuilder;
  }

  async create(
    authorId: string,
    dto: CreateCommunityPostDto,
    files?: Express.Multer.File[],
  ) {
    const user = await this.usersService.getUserById(authorId);
    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    const post = this.postRepo.create({
      title: dto.title,
      body: dto.body,
      author_id: authorId,
      status: PostStatus.POSTED,
      bumped_at: new Date(),
    });

    const savedPost = await this.postRepo.save(post);

    if (files && files.length > 0) {
      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'video/mp4',
        'video/x-matroska',
        'video/mkv',
        'video/x-mkv',
        'application/x-matroska',
      ];

      const uploadedUrls = await this.filesService.saveFiles(files, {
        subFolder: '/community-posts',
        allowedMimeTypes,
        customFileName: `${savedPost.id}-${Date.now()}`,
      });

      savedPost.media_urls = uploadedUrls;
      await this.postRepo.save(savedPost);
    }

    const fullPost = await this.postRepo.findOne({
      where: { id: savedPost.id },
      relations: { author: { auth: true } },
    });

    return {
      postId: savedPost.id,
      postedBy: this.formatPostedBy(fullPost?.author || user),
      created_at: savedPost.created_at,
      bumped_at: savedPost.bumped_at,
      title: savedPost.title,
      body: savedPost.body,
      media_urls: savedPost.media_urls || [],
      status: savedPost.status,
      CommunityResponse: this.formatCommunityResponse([], 0),
    };
  }

  async getAllPosts(
    search?: string,
    sort?: 'asc' | 'desc',
    currentUserId?: string,
  ) {
    const query = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('author.auth', 'auth')
      .leftJoinAndSelect('post.reactions', 'reactions')
      .leftJoinAndSelect('post.comments', 'comments');

    if (currentUserId) {
      query.where(
        '(post.status = :postedStatus OR (post.status = :archivedStatus AND post.author_id = :userId))',
        {
          postedStatus: PostStatus.POSTED,
          archivedStatus: PostStatus.ARCHIVED,
          userId: currentUserId,
        },
      );
    } else {
      query.where('post.status = :postedStatus', {
        postedStatus: PostStatus.POSTED,
      });
    }

    this.searchPost(query, search);
    this.sortPost(query, sort);

    const posts = await query.getMany();

    return posts.map((post) => ({
      postId: post.id,
      postedBy: this.formatPostedBy(post.author),
      created_at: post.created_at,
      bumped_at: post.bumped_at,
      title: post.title,
      body: post.body,
      media_urls: post.media_urls || [],
      status: post.status,
      CommunityResponse: this.formatCommunityResponse(
        post.reactions,
        post.comments ? post.comments.length : 0,
      ),
    }));
  }

  async getPostById(id: string, currentUserId?: string) {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: {
        author: { auth: true },
        reactions: true,
        comments: true,
      },
    });

    if (!post || post.status === PostStatus.REMOVED) {
      throw new NotFoundException('Community post not found');
    }

    if (
      post.status === PostStatus.ARCHIVED &&
      post.author_id !== currentUserId
    ) {
      throw new ForbiddenException(
        'This post is archived and can only be viewed by its author',
      );
    }

    return {
      postId: post.id,
      postedBy: this.formatPostedBy(post.author),
      created_at: post.created_at,
      bumped_at: post.bumped_at,
      title: post.title,
      body: post.body,
      media_urls: post.media_urls || [],
      status: post.status,
      CommunityResponse: this.formatCommunityResponse(
        post.reactions,
        post.comments ? post.comments.length : 0,
      ),
    };
  }

  async getCommentsByPostId(postId: string) {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post || post.status === PostStatus.REMOVED) {
      throw new NotFoundException('Community post not found');
    }

    const comments = await this.commentRepo.find({
      where: { post_id: postId },
      relations: { user: { auth: true } },
    });

    return comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      postedBy: this.formatPostedBy(comment.user),
    }));
  }

  async update(
    id: string,
    userId: string,
    role: string,
    dto: UpdateCommunityPostDto,
    files?: Express.Multer.File[],
  ) {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: { author: { auth: true } },
    });

    if (!post || post.status === PostStatus.REMOVED) {
      throw new NotFoundException('Community post not found');
    }

    if (post.author_id !== userId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    if (dto.title !== undefined) post.title = dto.title;
    if (dto.body !== undefined) post.body = dto.body;

    if (files && files.length > 0) {
      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'video/mp4',
        'video/x-matroska',
        'video/mkv',
        'video/x-mkv',
        'application/x-matroska',
      ];

      const uploadedUrls = await this.filesService.saveFiles(files, {
        subFolder: '/community-posts',
        allowedMimeTypes,
        customFileName: `${post.id}-${Date.now()}`,
      });

      post.media_urls = [...(post.media_urls || []), ...uploadedUrls];
    }

    const updatedPost = await this.postRepo.save(post);
    return {
      postId: updatedPost.id,
      postedBy: this.formatPostedBy(updatedPost.author),
      created_at: updatedPost.created_at,
      bumped_at: updatedPost.bumped_at,
      title: updatedPost.title,
      body: updatedPost.body,
      media_urls: updatedPost.media_urls || [],
      status: updatedPost.status,
    };
  }

  async updateStatus(
    id: string,
    userId: string,
    role: string,
    dto: UpdatePostStatusDto,
  ) {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: { author: { auth: true } },
    });

    if (!post) {
      throw new NotFoundException('Community post not found');
    }

    if (dto.status === PostStatus.REMOVED && role !== 'admin') {
      throw new ForbiddenException('Only an admin can remove posts');
    }

    if (
      (dto.status === PostStatus.ARCHIVED ||
        dto.status === PostStatus.POSTED) &&
      post.author_id !== userId &&
      role !== 'admin'
    ) {
      throw new ForbiddenException(
        'Only the post author or an admin can update post status',
      );
    }

    post.status = dto.status;
    const savedPost = await this.postRepo.save(post);

    return {
      postId: savedPost.id,
      postedBy: this.formatPostedBy(savedPost.author),
      status: savedPost.status,
    };
  }

  async bump(id: string, userId: string) {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: { author: { auth: true } },
    });

    if (!post || post.status === PostStatus.REMOVED) {
      throw new NotFoundException('Community post not found');
    }

    if (post.author_id !== userId) {
      throw new ForbiddenException('You can only bump your own posts');
    }

    post.bumped_at = new Date();
    const savedPost = await this.postRepo.save(post);

    return {
      postId: savedPost.id,
      postedBy: this.formatPostedBy(savedPost.author),
      bumped_at: savedPost.bumped_at,
      status: savedPost.status,
    };
  }

  async removePost(id: string, userId: string, role: string) {
    const post = await this.postRepo.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException('Community post not found');
    }

    if (post.author_id !== userId && role !== 'admin') {
      throw new ForbiddenException(
        'Only the post author or an admin can delete/remove this post',
      );
    }

    post.status = PostStatus.REMOVED;
    await this.postRepo.save(post);

    return { message: 'Community post removed successfully' };
  }

  async react(postId: string, userId: string, dto: ReactPostDto) {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post || post.status === PostStatus.REMOVED) {
      throw new NotFoundException('Community post not found');
    }

    const targetType = dto.type ? dto.type : ReactionType.LIKE;

    const existingReaction = await this.reactionRepo.findOne({
      where: { post_id: postId, user_id: userId },
    });

    if (existingReaction) {
      if (existingReaction.type === targetType) {
        await this.reactionRepo.remove(existingReaction);
        return { message: 'Reaction removed' };
      } else {
        existingReaction.type = targetType;
        return await this.reactionRepo.save(existingReaction);
      }
    }

    const newReaction = this.reactionRepo.create({
      post_id: postId,
      user_id: userId,
      type: targetType,
    });

    return await this.reactionRepo.save(newReaction);
  }

  async addComment(postId: string, userId: string, dto: CreateCommentDto) {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post || post.status === PostStatus.REMOVED) {
      throw new NotFoundException('Community post not found');
    }

    const comment = this.commentRepo.create({
      post_id: postId,
      user_id: userId,
      content: dto.content,
    });

    const savedComment = await this.commentRepo.save(comment);
    const user = await this.usersService.getUserById(userId);

    return {
      id: savedComment.id,
      content: savedComment.content,
      created_at: savedComment.created_at,
      updated_at: savedComment.updated_at,
      postedBy: this.formatPostedBy(user),
    };
  }

  async deleteComment(
    postId: string,
    commentId: string,
    userId: string,
    role: string,
  ) {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post || post.status === PostStatus.REMOVED) {
      throw new NotFoundException('Community post not found');
    }

    const comment = await this.commentRepo.findOne({
      where: { id: commentId, post_id: postId },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (
      comment.user_id !== userId &&
      post.author_id !== userId &&
      role !== 'admin'
    ) {
      throw new ForbiddenException(
        'You do not have permission to delete this comment',
      );
    }

    await this.commentRepo.remove(comment);
    return { message: 'Comment deleted successfully' };
  }

  async report(postId: string, reporterId: string, dto: ReportPostDto) {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post || post.status === PostStatus.REMOVED) {
      throw new NotFoundException('Community post not found');
    }

    const report = this.reportRepo.create({
      post_id: postId,
      reporter_id: reporterId,
      reason: dto.reason,
    });

    return await this.reportRepo.save(report);
  }
}
