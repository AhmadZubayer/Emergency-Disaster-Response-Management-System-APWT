import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateShelterDto {
  @ApiProperty({ example: 'Dhaka Central Relief Camp', minLength: 3, maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Mirpur-10, Dhaka' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 'https://example.com/shelter.jpg' })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({ example: 23.8103 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  gpsLat?: number;

  @ApiPropertyOptional({ example: 90.4125 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  gpsLng?: number;

  @ApiProperty({ example: 500, description: 'Maximum capacity', minimum: 1 })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  capacity: number;
}
