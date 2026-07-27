import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import {
  FieldReportType,
  ReportSeverity,
} from '../enums/volunteer-status.enum';

export class CreateRouteReportDto {
  @IsIn([FieldReportType.BLOCKED_ROUTE, FieldReportType.DANGEROUS_ROUTE])
  report_type: FieldReportType;

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
