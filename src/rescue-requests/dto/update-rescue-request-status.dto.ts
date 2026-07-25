import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { RescueStatus } from '../entities/rescue-request.entity';

export class UpdateRescueRequestStatusDto {
  @IsEnum(RescueStatus)
  @IsNotEmpty()
  status: RescueStatus;

  @IsOptional()
  @IsString()
  assigned_rescuer_id?: string;
}
