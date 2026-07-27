import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ReportSeverity } from '../enums/volunteer-status.enum';
import { IsEnum } from 'class-validator';

export class CreateResourceShortageDto {
  @IsString()
  resource_name: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity_needed: number;

  @IsString()
  description: string;

  @Type(() => Number)
  @IsNumber()
  latitude: number;

  @Type(() => Number)
  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(ReportSeverity)
  severity?: ReportSeverity;
}
