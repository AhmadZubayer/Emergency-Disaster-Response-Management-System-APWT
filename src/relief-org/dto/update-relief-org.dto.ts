import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReliefOrgDto {
  @ApiPropertyOptional({
    example: 'Bangladesh Red Crescent Society',
    description: 'Updated organization name',
    minLength: 3,
    maxLength: 150,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  orgName?: string;
}
