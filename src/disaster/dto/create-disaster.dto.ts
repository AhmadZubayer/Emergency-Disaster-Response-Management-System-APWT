import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DisasterType } from '../entities/disaster.entity';

export class CreateDisasterDto {
  @IsNotEmpty()
  @IsString()
  disasterName: string;

  @IsNotEmpty()
  @IsString()
  impactedLocation: string;

  @IsNotEmpty()
  @IsDateString()
  impactTime: string;

  @IsNotEmpty()
  @IsEnum(DisasterType)
  type: DisasterType;
}
