import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateVolunteerProfileDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsBoolean()
  available?: boolean;
}
