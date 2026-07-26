import {
  Body,
  Controller,
  Get,
  Param,
  ParseFloatPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { roles } from 'src/auth/decorators/roles.decorator';
import { JwtGuard } from 'src/auth/guards/access-jwt-guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { USER_ROLE } from 'src/auth/types/user-roles.type';
import { CreateOrganizationRequestDto } from './dto/create-organization-request.dto';
import { CreateResourceShortageDto } from './dto/create-resource-shortage.dto';
import { CreateRouteReportDto } from './dto/create-route-report.dto';
import { RegisterVolunteerDto } from './dto/register-volunteer.dto';
import { ReviewVolunteerVerificationDto } from './dto/review-volunteer-verification.dto';
import { UpdateTaskProgressDto } from './dto/update-task-progress.dto';
import { UpdateVolunteerLocationDto } from './dto/update-volunteer-location.dto';
import { UpdateVolunteerProfileDto } from './dto/update-volunteer-profile.dto';
import { VolunteersService } from './volunteers.service';

@Controller('volunteers')
@UseGuards(JwtGuard)
export class VolunteersController {
  constructor(private readonly volunteersService: VolunteersService) {}

  @Post('register')
  register(
    @CurrentUser('id') userId: string,
    @Body() dto: RegisterVolunteerDto,
  ) {
    return this.volunteersService.register(userId, dto);
  }

  @Get('me')
  getMyProfile(@CurrentUser('id') userId: string) {
    return this.volunteersService.getMyProfile(userId);
  }

  @Patch('me')
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateVolunteerProfileDto,
  ) {
    return this.volunteersService.updateProfile(userId, dto);
  }

  @Post('verification/apply')
  applyForVerification(@CurrentUser('id') userId: string) {
    return this.volunteersService.applyForVerification(userId);
  }

  @Patch(':id/verification')
  @UseGuards(RolesGuard)
  @roles(USER_ROLE.ADMIN)
  reviewVerification(
    @Param('id') volunteerId: string,
    @Body() dto: ReviewVolunteerVerificationDto,
  ) {
    return this.volunteersService.reviewVerification(volunteerId, dto.status);
  }

  @Patch('duty/location')
  updateLocation(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateVolunteerLocationDto,
  ) {
    return this.volunteersService.updateLocation(userId, dto);
  }

  @Get('rescue-requests/nearby')
  getNearbyRequests(
    @CurrentUser('id') userId: string,
    @Query('radius', new ParseFloatPipe({ optional: true })) radius?: number,
  ) {
    return this.volunteersService.getNearbyRequests(userId, radius ?? 25);
  }

  @Post('rescue-tasks/:requestId/accept')
  acceptTask(
    @CurrentUser('id') userId: string,
    @Param('requestId') requestId: string,
  ) {
    return this.volunteersService.acceptTask(userId, requestId);
  }

  @Post('rescue-tasks/:requestId/reject')
  rejectTask(
    @CurrentUser('id') userId: string,
    @Param('requestId') requestId: string,
  ) {
    return this.volunteersService.rejectTask(userId, requestId);
  }

  @Get('rescue-tasks/my')
  getAssignedTasks(@CurrentUser('id') userId: string) {
    return this.volunteersService.getAssignedTasks(userId);
  }

  @Patch('rescue-tasks/:taskId/progress')
  updateTaskProgress(
    @CurrentUser('id') userId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskProgressDto,
  ) {
    return this.volunteersService.updateTaskProgress(userId, taskId, dto);
  }

  @Patch('rescue-tasks/:taskId/complete')
  completeTask(
    @CurrentUser('id') userId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.volunteersService.completeTask(userId, taskId);
  }

  @Post('field-reports/routes')
  reportRoute(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateRouteReportDto,
  ) {
    return this.volunteersService.reportRoute(userId, dto);
  }

  @Post('field-reports/shortages')
  reportResourceShortage(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateResourceShortageDto,
  ) {
    return this.volunteersService.reportResourceShortage(userId, dto);
  }

  @Get('field-reports/my')
  getMyFieldReports(@CurrentUser('id') userId: string) {
    return this.volunteersService.getMyFieldReports(userId);
  }

  @Post('organization-requests')
  @UseGuards(RolesGuard)
  @roles(USER_ROLE.RELIEF_ORG, USER_ROLE.ADMIN)
  createOrganizationRequest(
    @CurrentUser('id') organizationUserId: string,
    @Body() dto: CreateOrganizationRequestDto,
  ) {
    return this.volunteersService.createOrganizationRequest(
      organizationUserId,
      dto,
    );
  }

  @Get('organization-requests')
  getOpenOrganizationRequests(@CurrentUser('id') userId: string) {
    return this.volunteersService.getOpenOrganizationRequests(userId);
  }

  @Post('organization-requests/:id/join')
  joinOrganizationRequest(
    @CurrentUser('id') userId: string,
    @Param('id') requestId: string,
  ) {
    return this.volunteersService.joinOrganizationRequest(userId, requestId);
  }

  @Get('organization-requests/my/joins')
  getMyOrganizationRequests(@CurrentUser('id') userId: string) {
    return this.volunteersService.getMyOrganizationRequests(userId);
  }
}
