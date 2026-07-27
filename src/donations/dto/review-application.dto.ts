import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { ApplicationStatus } from '../enums';

export class ReviewApplicationDto {
  @ApiProperty({
    enum: [ApplicationStatus.APPROVED, ApplicationStatus.REJECTED],
    example: ApplicationStatus.APPROVED,
  })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @ApiProperty({
    example: 15000,
    description: 'Amount approved by Relief Org (required if status is APPROVED)',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  approved_amount?: number;
}
