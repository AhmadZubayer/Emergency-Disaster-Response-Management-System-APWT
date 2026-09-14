import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { roles } from 'src/auth/decorators/roles.decorator';
import { JwtGuard } from 'src/auth/guards/access-jwt-guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { USER_ROLE } from 'src/auth/types/user-roles.type';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtGuard, RolesGuard)
@roles(USER_ROLE.ADMIN)
@ApiTags('Admin')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('accounts')
  @ApiOperation({ summary: 'List registered accounts' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'role', required: false, example: 'user' })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean, example: false })
  listAccounts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('role') role?: string,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    return this.adminService.listAccounts({
      page,
      limit,
      role,
      includeDeleted: includeDeleted === 'true',
    });
  }

  @Post('accounts')
  @ApiOperation({ summary: 'Create a new account' })
  createAccount(
    @Body() dto: { name: string; email: string; password?: string; role?: string; phone?: string },
  ) {
    return this.adminService.createAccount(dto);
  }

  @Patch('accounts/:id/role')
  @ApiOperation({ summary: 'Update an account role' })
  updateAccountRole(@Param('id') id: string, @Body('role') role: string) {
    return this.adminService.updateAccountRole(id, role);
  }

  @Delete('accounts/:id')
  @ApiOperation({ summary: 'Soft delete an account' })
  softDeleteAccount(@Param('id') id: string) {
    return this.adminService.softDeleteAccount(id);
  }

  @Patch('accounts/:id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted account' })
  restoreAccount(@Param('id') id: string) {
    return this.adminService.restoreAccount(id);
  }

  @Get('volunteers')
  @ApiOperation({ summary: 'List volunteers' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, example: 'verified' })
  listVolunteers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.listVolunteers({ page, limit, status });
  }

  @Patch('volunteers/:id/verify')
  @ApiOperation({ summary: 'Verify a volunteer account' })
  verifyVolunteer(@Param('id') id: string, @Body('status') status: string) {
    return this.adminService.verifyVolunteer(id, status);
  }

  @Get('relief-orgs')
  @ApiOperation({ summary: 'List relief organizations' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, example: 'pending' })
  listReliefOrgs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.listReliefOrgs({ page, limit, status });
  }

  @Patch('relief-orgs/:id/verify')
  @ApiOperation({ summary: 'Verify a relief organization' })
  verifyReliefOrg(@Param('id') id: string, @Body('status') status: string) {
    return this.adminService.verifyReliefOrg(id, status);
  }

  @Get('disasters')
  @ApiOperation({ summary: 'List disaster reports' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'verified', required: false, type: Boolean, example: true })
  listDisasters(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('verified') verified?: string,
  ) {
    return this.adminService.listDisasters({
      page,
      limit,
      verified,
    });
  }

  @Post('disasters')
  @ApiOperation({ summary: 'Create a disaster alert' })
  createDisaster(
    @Body() dto: { disaster_name: string; disaster_type: string; impacted_location: string; impact_time?: string; severity_level?: string; is_verified?: boolean },
  ) {
    return this.adminService.createDisaster(dto);
  }

  @Patch('disasters/:id/verify')
  @ApiOperation({ summary: 'Verify a disaster report' })
  verifyDisaster(@Param('id') id: string, @Body('verified') verified: boolean) {
    return this.adminService.verifyDisaster(id, verified);
  }

  @Get('rescue-requests')
  @ApiOperation({ summary: 'List rescue requests' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, example: 'pending' })
  listRescueRequests(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.listRescueRequests({ page, limit, status });
  }

  @Post('rescue-requests')
  @ApiOperation({ summary: 'Create an emergency rescue request' })
  createRescueRequest(
    @CurrentUser('id') adminUserId: string,
    @Body() dto: { requester_name?: string; contact_phone?: string; location?: string; address?: string; urgency_level?: string; details?: string; description?: string; user_id?: string },
  ) {
    return this.adminService.createRescueRequest(dto, adminUserId);
  }

  @Get('community-posts')
  @ApiOperation({ summary: 'List community posts' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, example: 'posted' })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean, example: false })
  listCommunityPosts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    return this.adminService.listCommunityPosts({
      page,
      limit,
      status,
      includeDeleted: includeDeleted === 'true',
    });
  }

  @Patch('community-posts/:id/status')
  @ApiOperation({ summary: 'Moderate a community post status' })
  moderateCommunityPost(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.adminService.moderateCommunityPost(id, status);
  }

  @Delete('community-posts/:id')
  @ApiOperation({ summary: 'Soft delete a community post' })
  softDeleteCommunityPost(@Param('id') id: string) {
    return this.adminService.softDeleteCommunityPost(id);
  }

  @Patch('community-posts/:id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted community post' })
  restoreCommunityPost(@Param('id') id: string) {
    return this.adminService.restoreCommunityPost(id);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Generate an admin report summary' })
  generateReport() {
    return this.adminService.generateReport();
  }

  @Get('tables')
  @ApiOperation({ summary: 'List all database tables with total record counts' })
  listTables() {
    return this.adminService.listTables();
  }

  @Get('tables/:tableName')
  @ApiOperation({ summary: 'Retrieve raw data records from a specified database table' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  getTableData(
    @Param('tableName') tableName: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getTableData(tableName, { page, limit });
  }
}
