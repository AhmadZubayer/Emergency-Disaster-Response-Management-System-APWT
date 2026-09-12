import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { DisasterType } from '../entities/disaster.entity';

export class UpdateDisasterDto {
  @IsOptional()
  @IsString()
  disasterName?: string;

  @IsOptional()
  @IsString()
  impactedLocation?: string;

  @IsOptional()
  @IsDateString()
  impactTime?: string;

  @IsOptional()
  @IsEnum(DisasterType)
  type?: DisasterType;
}
