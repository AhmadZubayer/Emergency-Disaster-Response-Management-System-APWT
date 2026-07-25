import { IsEnum, IsOptional } from 'class-validator';
import { ReactionType } from '../enums/reaction-type.enum';

export class ReactPostDto {
  @IsOptional()
  @IsEnum(ReactionType)
  type?: ReactionType;
}
