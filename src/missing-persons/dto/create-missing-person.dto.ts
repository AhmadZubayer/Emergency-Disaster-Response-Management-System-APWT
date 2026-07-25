import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateMissingPersonDto {
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  age: number;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsString()
  @IsNotEmpty()
  last_seen_location: string;

  @IsString()
  @IsNotEmpty()
  last_seen_date: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  contact_phone?: string;

  @IsOptional()
  @IsString()
  photo_url?: string;
}
