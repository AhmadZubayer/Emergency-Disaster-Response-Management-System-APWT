import { IsEnum, IsNotEmpty } from 'class-validator';
import { MissingPersonStatus } from '../entities/missing-person.entity';

export class UpdateMissingPersonStatusDto {
  @IsEnum(MissingPersonStatus)
  @IsNotEmpty()
  status: MissingPersonStatus;
}
