import { IsEnum } from 'class-validator';
import { PostStatus } from '../enums/post-status.enum';

export class UpdatePostStatusDto {
  @IsEnum(PostStatus)
  status: PostStatus;
}
