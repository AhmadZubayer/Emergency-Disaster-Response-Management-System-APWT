import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { OrganizationRequestStatus } from '../enums/volunteer-status.enum';

export class CreateOrganizationRequestDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  required_skills?: string[];

  @IsString()
  location: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  needed_volunteers: number;

  @IsOptional()
  @IsString()
  disaster_name?: string;

  @IsOptional()
  @IsEnum(OrganizationRequestStatus)
  status?: OrganizationRequestStatus;
}
