import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ShelterService } from './shelter.service';
import { CreateShelterDto } from './dto/create-shelter.dto';
import { UpdateShelterDto } from './dto/update-shelter.dto';
import { JwtGuard } from 'src/auth/guards/access-jwt-guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { USER_ROLE } from 'src/auth/types/user-roles.type';

@ApiTags('Shelter')
@Controller('shelter')
export class ShelterController {
  constructor(private readonly shelterService: ShelterService) {}

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @roles(USER_ROLE.RELIEF_ORG, USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a shelter for a disaster (Relief Org or Admin only)',
  })
  @ApiResponse({ status: 201, description: 'Shelter created successfully.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires verified Relief Org or Admin role.',
  })
  @ResponseMessage('Shelter created successfully')
  create(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Body() dto: CreateShelterDto,
  ) {
    return this.shelterService.createShelter(userId, role, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get list of shelters (Optional filter by disaster)' })
  @ApiQuery({ name: 'disasterId', required: false })
  @ResponseMessage('Shelters retrieved successfully')
  findAll(@Query('disasterId') disasterId?: string) {
    return this.shelterService.getShelters(disasterId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shelter details by ID' })
  @ApiParam({ name: 'id', description: 'Shelter UUID' })
  @ResponseMessage('Shelter details retrieved successfully')
  findOne(@Param('id') id: string) {
    return this.shelterService.getShelterById(id);
  }

  @Patch(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @roles(USER_ROLE.RELIEF_ORG, USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a shelter (Restricted to managing Relief Org or Admin)',
  })
  @ApiParam({ name: 'id', description: 'Shelter UUID' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Cannot update shelters belonging to other Relief Orgs.',
  })
  @ResponseMessage('Shelter updated successfully')
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Body() dto: UpdateShelterDto,
  ) {
    return this.shelterService.updateShelter(id, userId, role, dto);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @roles(USER_ROLE.RELIEF_ORG, USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a shelter (Restricted to managing Relief Org or Admin)',
  })
  @ApiParam({ name: 'id', description: 'Shelter UUID' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Cannot delete shelters belonging to other Relief Orgs.',
  })
  @ResponseMessage('Shelter deleted successfully')
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.shelterService.deleteShelter(id, userId, role);
  }
}
