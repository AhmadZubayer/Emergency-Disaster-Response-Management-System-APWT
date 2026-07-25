import { Module } from '@nestjs/common';
import { CommunityPostsService } from './community-posts.service';
import { CommunityPostsController } from './community-posts.controller';

@Module({
  controllers: [CommunityPostsController],
  providers: [CommunityPostsService],
})
export class CommunityPostsModule {}
