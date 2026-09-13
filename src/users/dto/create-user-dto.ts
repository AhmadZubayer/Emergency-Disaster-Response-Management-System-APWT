import { Type } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { AddressDto } from './address.dto';

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
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsOptional()
  @IsString()
  house?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  country?: string;

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

