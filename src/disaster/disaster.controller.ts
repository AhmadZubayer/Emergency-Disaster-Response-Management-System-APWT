import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DisasterService } from './disaster.service';
import { CreateDisasterDto } from './dto/create-disaster.dto';
import { UpdateDisasterDto } from './dto/update-disaster.dto';
import { JwtGuard } from 'src/auth/guards/access-jwt-guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { roles } from 'src/auth/decorators/roles.decorator';
import { USER_ROLE } from 'src/auth/types/user-roles.type';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';

@ApiTags('Disaster')
@Controller('disaster')
export class DisasterController {
  constructor(private readonly disasterService: DisasterService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtGuard, RolesGuard)
  @roles(USER_ROLE.RELIEF_ORG, USER_ROLE.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new disaster alert (relief_org only)' })
  @ApiResponse({ status: 201, description: 'Disaster created and notifications sent.' })
  @ApiResponse({ status: 403, description: 'Forbidden — relief_org role required.' })
  @ResponseMessage('Disaster alert created successfully')
  create(@Body() dto: CreateDisasterDto) {
    return this.disasterService.createDisaster(dto);
  }

  @Get()
  @ResponseMessage('Disaster alerts retrieved successfully')
  findAll() {
    return this.disasterService.findAll();
  }

  @Get(':id')
  @ResponseMessage('Disaster details retrieved successfully')
  findOne(@Param('id') id: string) {
    return this.disasterService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtGuard, RolesGuard)
  @roles(USER_ROLE.RELIEF_ORG, USER_ROLE.ADMIN)
  @ResponseMessage('Disaster alert updated successfully')
  update(@Param('id') id: string, @Body() dto: UpdateDisasterDto) {
    return this.disasterService.update(id, dto);
  }

  @Patch(':id/mark-safe')
  @ApiBearerAuth()
  @UseGuards(JwtGuard, RolesGuard)
  @roles(USER_ROLE.RELIEF_ORG, USER_ROLE.ADMIN)
  @ResponseMessage('Disaster alert marked as safe successfully')
  markAsSafe(@Param('id') id: string) {
    return this.disasterService.markAsSafe(id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtGuard, RolesGuard)
  @roles(USER_ROLE.RELIEF_ORG, USER_ROLE.ADMIN)
  @ResponseMessage('Disaster alert deleted successfully')
  remove(@Param('id') id: string) {
    return this.disasterService.remove(id);
  }
}

