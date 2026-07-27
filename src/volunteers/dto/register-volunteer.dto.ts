import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class RegisterVolunteerDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsBoolean()
  available?: boolean;
}
