import { IsNotEmpty, IsString } from 'class-validator';

export class ReportPostDto {
  @IsNotEmpty()
  @IsString()
  reason: string;
}
