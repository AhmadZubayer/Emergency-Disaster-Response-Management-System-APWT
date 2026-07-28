import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DisasterService } from './disaster.service';
import { CreateDisasterDto } from './dto/create-disaster.dto';
import { JwtGuard } from 'src/auth/guards/access-jwt-guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { roles } from 'src/auth/decorators/roles.decorator';
import { USER_ROLE } from 'src/auth/types/user-roles.type';

import { ResponseMessage } from 'src/common/decorators/response-message.decorator';

@ApiTags('Disaster')
@ApiBearerAuth()
@Controller('disaster')
export class DisasterController {
  constructor(private readonly disasterService: DisasterService) {}

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @roles(USER_ROLE.RELIEF_ORG)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new disaster alert (relief_org only)' })
  @ApiResponse({ status: 201, description: 'Disaster created and notifications sent.' })
  @ApiResponse({ status: 403, description: 'Forbidden — relief_org role required.' })
  @ResponseMessage('Disaster alert created successfully')
  create(@Body() dto: CreateDisasterDto) {
    return this.disasterService.createDisaster(dto);
  }
}
