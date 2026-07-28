import { PartialType } from '@nestjs/swagger';
import { CreateShelterDto } from './create-shelter.dto';

export class UpdateShelterDto extends PartialType(CreateShelterDto) {}
