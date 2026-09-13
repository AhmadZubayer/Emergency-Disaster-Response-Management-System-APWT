import { PartialType } from '@nestjs/mapped-types';
import { CreateRescueRequestDto } from './create-rescue-request.dto';

export class UpdateRescueRequestDto extends PartialType(CreateRescueRequestDto) {}
