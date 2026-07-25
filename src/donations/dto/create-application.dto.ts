import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({
    example: 'Home damaged by Sylhet flood, urgently need financial assistance.',
    description: 'Detailed explanation of why aid is needed',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({
    example: 'bKash: 01700000000 (Personal)',
    description: 'Account details where approved funds should be received',
  })
  @IsString()
  @IsNotEmpty()
  payout_details: string;

  @ApiPropertyOptional({
    example: 'https://storage.example.com/proof.jpg',
    description: 'Optional proof document or photo URL',
  })
  @IsUrl()
  @IsOptional()
  proof_document_url?: string;
}
