import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReliefOrgDto {
  // userId আর DTO-তে নেই।
  // JWT token থেকে @CurrentUser('id') দিয়ে user id পাওয়া যাবে।

  @ApiProperty({
    example: 'Red Crescent Society Bangladesh',
    description: 'Official name of the relief organization',
    minLength: 3,
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(150)
  orgName: string;
}
