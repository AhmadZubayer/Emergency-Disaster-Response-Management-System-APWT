import { IsEnum, IsOptional, IsString } from 'class-validator';
import { VolunteerTaskStatus } from '../enums/volunteer-status.enum';

export class UpdateTaskProgressDto {
  @IsEnum(VolunteerTaskStatus)
  status: VolunteerTaskStatus;

  @IsOptional()
  @IsString()
  progress_note?: string;
}
