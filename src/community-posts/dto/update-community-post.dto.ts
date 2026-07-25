import { IsOptional, IsString } from 'class-validator';

export class UpdateCommunityPostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  body?: string;
}
