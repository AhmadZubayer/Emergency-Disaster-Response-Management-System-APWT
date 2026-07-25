import { IsOptional, IsString } from 'class-validator';

export class AddressDto {
  @IsOptional()
  @IsString()
  house?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  country?: string;
}
