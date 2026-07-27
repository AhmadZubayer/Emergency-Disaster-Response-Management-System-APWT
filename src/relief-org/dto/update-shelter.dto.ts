import { IsString, IsOptional, IsNumber, IsEnum, Min, Max, MinLength, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ShelterStatus } from '../entities/shelter.entity';

export class UpdateShelterDto {
  @ApiPropertyOptional({ example: 'Mirpur Relief Camp Block-B' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'Mirpur-12, Dhaka' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 'https://example.com/updated.jpg' })
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

  @ApiPropertyOptional({ example: 750, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({ example: 320, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  currentOccupancy?: number;

  @ApiPropertyOptional({ enum: ShelterStatus, example: ShelterStatus.FULL })
  @IsOptional()
  @IsEnum(ShelterStatus)
  status?: ShelterStatus;
}
