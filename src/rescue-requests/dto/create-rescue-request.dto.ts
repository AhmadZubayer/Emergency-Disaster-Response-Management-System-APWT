import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { UrgencyLevel } from '../entities/rescue-request.entity';

export class CreateRescueRequestDto {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  contact_phone: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  people_count?: number;

  @IsOptional()
  @IsEnum(UrgencyLevel)
  urgency_level?: UrgencyLevel;

  @IsOptional()
  @IsString()
  medical_notes?: string;

  @IsOptional()
  @IsString()
  photo_url?: string;
}
