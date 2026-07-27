import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DonationStatus } from '../entities/donation.entity';

export class UpdateDonationDto {
  @ApiProperty({ enum: DonationStatus, example: DonationStatus.RECEIVED })
  @IsEnum(DonationStatus)
  @IsNotEmpty()
  status: DonationStatus;
}
