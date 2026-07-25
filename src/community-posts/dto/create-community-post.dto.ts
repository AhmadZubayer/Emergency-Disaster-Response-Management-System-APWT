import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommunityPostDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  body: string;
}
