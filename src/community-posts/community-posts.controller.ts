import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CommunityPostsService } from './community-posts.service';
import { CreateCommunityPostDto } from './dto/create-community-post.dto';
import { UpdateCommunityPostDto } from './dto/update-community-post.dto';
import { UpdatePostStatusDto } from './dto/update-post-status.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ReactPostDto } from './dto/react-post.dto';
import { ReportPostDto } from './dto/report-post.dto';
import { JwtGuard } from 'src/auth/guards/access-jwt-guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';

@Controller('community-posts')
export class CommunityPostsController {
  constructor(
    private readonly communityPostsService: CommunityPostsService,
  ) {}

  @Get()
  @ResponseMessage('Community posts retrieved successfully')
  async findAll(
    @Query('search') search?: string,
    @Query('sort') sort?: 'asc' | 'desc',
    @Query('userId') userId?: string,
  ) {
    return await this.communityPostsService.getAllPosts(search, sort, userId);
  }

  @Get(':id')
  @ResponseMessage('Community post details retrieved successfully')
  async findOne(@Param('id') id: string, @Query('userId') userId?: string) {
    return await this.communityPostsService.getPostById(id, userId);
  }

  @Get(':id/comments')
  @ResponseMessage('Post comments retrieved successfully')
  async getComments(@Param('id') id: string) {
    return await this.communityPostsService.getCommentsByPostId(id);
  }

  @Post()
  @UseGuards(JwtGuard)
  @UseInterceptors(FilesInterceptor('files'))
  @ResponseMessage('Community post created successfully')
  async create(
    @CurrentUser('id') authorId: string,
    @Body() dto: CreateCommunityPostDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return await this.communityPostsService.create(authorId, dto, files);
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  @UseInterceptors(FilesInterceptor('files'))
  @ResponseMessage('Community post updated successfully')
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Body() dto: UpdateCommunityPostDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return await this.communityPostsService.update(
      id,
      userId,
      role,
      dto,
      files,
    );
  }

  @Patch(':id/status')
  @UseGuards(JwtGuard)
  @ResponseMessage('Post status updated successfully')
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Body() dto: UpdatePostStatusDto,
  ) {
    return await this.communityPostsService.updateStatus(
      id,
      userId,
      role,
      dto,
    );
  }

  @Patch(':id/bump')
  @UseGuards(JwtGuard)
  @ResponseMessage('Post bumped successfully')
  async bump(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return await this.communityPostsService.bump(id, userId);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  @ResponseMessage('Community post deleted successfully')
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return await this.communityPostsService.removePost(id, userId, role);
  }

  @Post(':id/react')
  @UseGuards(JwtGuard)
  @ResponseMessage('Reaction recorded successfully')
  async react(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ReactPostDto,
  ) {
    return await this.communityPostsService.react(id, userId, dto);
  }

  @Post(':id/comments')
  @UseGuards(JwtGuard)
  @ResponseMessage('Comment added successfully')
  async addComment(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return await this.communityPostsService.addComment(id, userId, dto);
  }

  @Delete(':id/comments/:commentId')
  @UseGuards(JwtGuard)
  @ResponseMessage('Comment deleted successfully')
  async deleteComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return await this.communityPostsService.deleteComment(
      id,
      commentId,
      userId,
      role,
    );
  }

  @Post(':id/report')
  @UseGuards(JwtGuard)
  @ResponseMessage('Post reported successfully')
  async report(
    @Param('id') id: string,
    @CurrentUser('id') reporterId: string,
    @Body() dto: ReportPostDto,
  ) {
    return await this.communityPostsService.report(id, reporterId, dto);
  }
}
