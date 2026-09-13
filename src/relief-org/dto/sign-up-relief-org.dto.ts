import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class SignUpReliefOrgDto {
  @ApiProperty({ example: 'Red Cross Bangladesh', minLength: 3 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  organization_name: string;

  @ApiProperty({ example: 'NGO-REG-2026-9876' })
  @IsString()
  @IsNotEmpty()
  registration_number: string;

  @ApiProperty({ example: 'House 12, Road 5, Dhanmondi, Dhaka' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({ example: 'contact@redcross.org.bd' })
  @IsOptional()
  @IsString()
  contact_email?: string;

  @ApiPropertyOptional({ example: '+8801712345678' })
  @IsOptional()
  @IsString()
  contact_phone?: string;

  @ApiPropertyOptional({ example: 'https://redcross.org.bd' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ example: 'Providing emergency relief and disaster management assistance.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'NGO' })
  @IsOptional()
  @IsString()
  organization_type?: string;
}
