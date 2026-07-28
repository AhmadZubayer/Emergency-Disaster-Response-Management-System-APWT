import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateShelterDto {
  @ApiProperty({ example: 'Mirpur Central Relief Camp' })
  @IsString()
  @IsNotEmpty()
  shelter_name: string;

  @ApiProperty({ example: 'Mirpur Stadium, Section 10, Dhaka' })
  @IsString()
  @IsNotEmpty()
  shelter_location: string;

  @ApiProperty({ example: 500, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  shelter_capacity: number;

  @ApiPropertyOptional({ example: 45, minimum: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  current_people_count?: number;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @IsUUID()
  @IsNotEmpty()
  disaster_id: string;
}
