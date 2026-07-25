import { PartialType } from '@nestjs/mapped-types';
import { CreateMissingPersonDto } from './create-missing-person.dto';

export class UpdateMissingPersonDto extends PartialType(CreateMissingPersonDto) {}
