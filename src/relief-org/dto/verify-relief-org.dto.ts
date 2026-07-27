import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VerificationStatus } from '../entities/relief-org.entity';

export class VerifyReliefOrgDto {
  @ApiProperty({
    enum: VerificationStatus,
    example: VerificationStatus.VERIFIED,
    description: 'New verification status set by admin',
  })
  @IsEnum(VerificationStatus)
  @IsNotEmpty()
  verificationStatus!: VerificationStatus;
}
