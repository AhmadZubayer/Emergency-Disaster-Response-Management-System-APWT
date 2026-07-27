import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PaymentGateway } from '../enums';

export class CreateDonationDto {
  @ApiProperty({ example: 1000, description: 'Donation amount' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({
    enum: PaymentGateway,
    default: PaymentGateway.STRIPE,
  })
  @IsEnum(PaymentGateway)
  @IsOptional()
  payment_gateway?: PaymentGateway;

  @ApiPropertyOptional({ example: false, default: false })
  @IsBoolean()
  @IsOptional()
  is_anonymous?: boolean;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  donor_name?: string;

  @ApiPropertyOptional({ example: 'donor@example.com' })
  @IsEmail()
  @IsOptional()
  donor_email?: string;
}
