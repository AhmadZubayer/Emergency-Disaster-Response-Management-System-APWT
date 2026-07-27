import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsInt, IsString, Min } from 'class-validator';

export class CreateOrganizationRequestDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  required_skills: string[];

  @IsString()
  location: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  needed_volunteers: number;
}
