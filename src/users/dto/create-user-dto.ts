import { Type } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';

export class CreateUsersDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  location?: string;

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
