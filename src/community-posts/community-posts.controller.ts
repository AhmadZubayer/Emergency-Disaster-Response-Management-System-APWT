import { Controller } from '@nestjs/common';
import { CommunityPostsService } from './community-posts.service';

@Controller('community-posts')
export class CommunityPostsController {
  constructor(private readonly communityPostsService: CommunityPostsService) {}
}
