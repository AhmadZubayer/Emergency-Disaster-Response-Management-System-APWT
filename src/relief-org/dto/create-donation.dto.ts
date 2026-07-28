import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { DonationMethod } from '../entities/donation.entity';

export class CreateDonationDto {
  @ApiProperty({ example: 1000, description: 'Donation amount' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ example: 'user-uuid' })
  @IsString()
  @IsNotEmpty()
  donorId: string;

  @ApiProperty({ enum: DonationMethod, example: DonationMethod.CASH })
  @IsEnum(DonationMethod)
  method: DonationMethod;

  @ApiPropertyOptional({ example: 'TXN-123456' })
  @IsOptional()
  @IsString()
  transactionRef?: string;
}
