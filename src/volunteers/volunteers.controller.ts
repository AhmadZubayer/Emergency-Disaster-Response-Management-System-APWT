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
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';

@Controller('volunteers')
@UseGuards(JwtGuard)
export class VolunteersController {
  constructor(private readonly volunteersService: VolunteersService) {}

  @Post('register')
  @ResponseMessage('Volunteer registered successfully')
  register(
    @CurrentUser('id') userId: string,
    @Body() dto: RegisterVolunteerDto,
  ) {
    return this.volunteersService.register(userId, dto);
  }

  @Get('me')
  @ResponseMessage('Volunteer profile retrieved successfully')
  getMyProfile(@CurrentUser('id') userId: string) {
    return this.volunteersService.getMyProfile(userId);
  }

  @Patch('me')
  @ResponseMessage('Volunteer profile updated successfully')
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateVolunteerProfileDto,
  ) {
    return this.volunteersService.updateProfile(userId, dto);
  }

  @Post('verification/apply')
  @ResponseMessage('Verification application submitted successfully')
  applyForVerification(@CurrentUser('id') userId: string) {
    return this.volunteersService.applyForVerification(userId);
  }

  @Patch(':id/verification')
  @UseGuards(RolesGuard)
  @roles(USER_ROLE.ADMIN)
  @ResponseMessage('Volunteer verification status reviewed successfully')
  reviewVerification(
    @Param('id') volunteerId: string,
    @Body() dto: ReviewVolunteerVerificationDto,
  ) {
    return this.volunteersService.reviewVerification(volunteerId, dto.status);
  }

  @Patch('duty/location')
  @ResponseMessage('Duty location updated successfully')
  updateLocation(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateVolunteerLocationDto,
  ) {
    return this.volunteersService.updateLocation(userId, dto);
  }

  @Get('rescue-requests/nearby')
  @ResponseMessage('Nearby rescue requests retrieved successfully')
  getNearbyRequests(
    @CurrentUser('id') userId: string,
    @Query('radius', new ParseFloatPipe({ optional: true })) radius?: number,
  ) {
    return this.volunteersService.getNearbyRequests(userId, radius ?? 25);
  }

  @Post('rescue-tasks/:requestId/accept')
  @ResponseMessage('Rescue task accepted successfully')
  acceptTask(
    @CurrentUser('id') userId: string,
    @Param('requestId') requestId: string,
  ) {
    return this.volunteersService.acceptTask(userId, requestId);
  }

  @Post('rescue-tasks/:requestId/reject')
  @ResponseMessage('Rescue task rejected')
  rejectTask(
    @CurrentUser('id') userId: string,
    @Param('requestId') requestId: string,
  ) {
    return this.volunteersService.rejectTask(userId, requestId);
  }

  @Get('rescue-tasks/my')
  @ResponseMessage('Assigned tasks retrieved successfully')
  getAssignedTasks(@CurrentUser('id') userId: string) {
    return this.volunteersService.getAssignedTasks(userId);
  }

  @Patch('rescue-tasks/:taskId/progress')
  @ResponseMessage('Task progress updated successfully')
  updateTaskProgress(
    @CurrentUser('id') userId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskProgressDto,
  ) {
    return this.volunteersService.updateTaskProgress(userId, taskId, dto);
  }

  @Patch('rescue-tasks/:taskId/complete')
  @ResponseMessage('Task completed successfully')
  completeTask(
    @CurrentUser('id') userId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.volunteersService.completeTask(userId, taskId);
  }

  @Post('field-reports/routes')
  @ResponseMessage('Route report created successfully')
  reportRoute(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateRouteReportDto,
  ) {
    return this.volunteersService.reportRoute(userId, dto);
  }

  @Post('field-reports/shortages')
  @ResponseMessage('Resource shortage report created successfully')
  reportResourceShortage(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateResourceShortageDto,
  ) {
    return this.volunteersService.reportResourceShortage(userId, dto);
  }

  @Get('field-reports/my')
  @ResponseMessage('Field reports retrieved successfully')
  getMyFieldReports(@CurrentUser('id') userId: string) {
    return this.volunteersService.getMyFieldReports(userId);
  }

  @Post('organization-requests')
  @UseGuards(RolesGuard)
  @roles(USER_ROLE.RELIEF_ORG, USER_ROLE.ADMIN)
  @ResponseMessage('Organization request created successfully')
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
  @ResponseMessage('Open organization requests retrieved successfully')
  getOpenOrganizationRequests(@CurrentUser('id') userId: string) {
    return this.volunteersService.getOpenOrganizationRequests(userId);
  }

  @Post('organization-requests/:id/join')
  @ResponseMessage('Joined organization request successfully')
  joinOrganizationRequest(
    @CurrentUser('id') userId: string,
    @Param('id') requestId: string,
  ) {
    return this.volunteersService.joinOrganizationRequest(userId, requestId);
  }

  @Get('organization-requests/my/joins')
  @ResponseMessage('User organization requests retrieved successfully')
  getMyOrganizationRequests(@CurrentUser('id') userId: string) {
    return this.volunteersService.getMyOrganizationRequests(userId);
  }
}
