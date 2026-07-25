import { Type } from 'class-transformer';
import { IsOptional, IsNumber, IsString } from 'class-validator';

export class CompleteUserProfileDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  gps_lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  gps_lng?: number;

  @IsOptional()
  @IsString()
  emergency_message?: string;

  @IsOptional()
  @IsString()
  medical_information?: string;
}
