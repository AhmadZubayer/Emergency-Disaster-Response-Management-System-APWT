import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { VolunteerSkill } from '../enums/volunteer-status.enum';

export class RegisterVolunteerDto {
  @IsArray()
  @IsEnum(VolunteerSkill, { each: true })
  skills: VolunteerSkill[];

  @IsNotEmpty()
  @IsString()
  why_join: string;

  @IsOptional()
  @IsBoolean()
  available?: boolean;
}

