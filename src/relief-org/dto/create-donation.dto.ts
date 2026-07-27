import { IsUUID, IsNotEmpty, IsNumber, IsEnum, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DonationMethod } from '../entities/donation.entity';

export class CreateDonationDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID of the user making this donation',
  })
  @IsUUID()
  @IsNotEmpty()
  donorId: string;

  @ApiProperty({ example: 5000.00, description: 'Donation amount in BDT', minimum: 1 })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  amount: number;

  @ApiProperty({ enum: DonationMethod, example: DonationMethod.MOBILE_BANKING })
  @IsEnum(DonationMethod)
  @IsNotEmpty()
  method: DonationMethod;

  @ApiPropertyOptional({ example: 'TXN123456789', description: 'Transaction reference (optional for cash)' })
  @IsOptional()
  @IsString()
  transactionRef?: string;
}
