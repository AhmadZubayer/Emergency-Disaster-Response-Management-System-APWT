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

@Controller('community-posts')
export class CommunityPostsController {
  constructor(
    private readonly communityPostsService: CommunityPostsService,
  ) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('sort') sort?: 'asc' | 'desc',
    @Query('userId') userId?: string,
  ) {
    return await this.communityPostsService.getAllPosts(search, sort, userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Query('userId') userId?: string) {
    return await this.communityPostsService.getPostById(id, userId);
  }

  @Get(':id/comments')
  async getComments(@Param('id') id: string) {
    return await this.communityPostsService.getCommentsByPostId(id);
  }

  @Post()
  @UseGuards(JwtGuard)
  @UseInterceptors(FilesInterceptor('files'))
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
  async bump(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return await this.communityPostsService.bump(id, userId);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return await this.communityPostsService.removePost(id, userId, role);
  }

  @Post(':id/react')
  @UseGuards(JwtGuard)
  async react(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ReactPostDto,
  ) {
    return await this.communityPostsService.react(id, userId, dto);
  }

  @Post(':id/comments')
  @UseGuards(JwtGuard)
  async addComment(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return await this.communityPostsService.addComment(id, userId, dto);
  }

  @Delete(':id/comments/:commentId')
  @UseGuards(JwtGuard)
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
  async report(
    @Param('id') id: string,
    @CurrentUser('id') reporterId: string,
    @Body() dto: ReportPostDto,
  ) {
    return await this.communityPostsService.report(id, reporterId, dto);
  }
}
