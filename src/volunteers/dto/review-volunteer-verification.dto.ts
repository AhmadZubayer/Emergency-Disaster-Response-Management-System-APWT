import { IsEnum } from 'class-validator';
import { VolunteerVerificationStatus } from '../enums/volunteer-status.enum';

export class ReviewVolunteerVerificationDto {
  @IsEnum(VolunteerVerificationStatus)
  status: VolunteerVerificationStatus;
}
