import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtGuard } from 'src/auth/guards/access-jwt-guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { roles } from 'src/auth/decorators/roles.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { USER_ROLE } from 'src/auth/types/user-roles.type';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtGuard, RolesGuard)
@roles(USER_ROLE.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get(['volunteer-verification-requests', '/volunteer-verification-requests'])
  @ApiOperation({ summary: 'Admin view all volunteer verification requests' })
  @ResponseMessage('Volunteer verification requests retrieved successfully')
  getVolunteerVerificationRequests() {
    return this.adminService.getVolunteerVerificationRequests();
  }

  @Get(['relief-org-verification-requests', '/relief-org-verification-requests'])
  @ApiOperation({
    summary: 'Admin view all relief organization verification requests',
  })
  @ResponseMessage('Relief organization verification requests retrieved successfully')
  getReliefOrgVerificationRequests() {
    return this.adminService.getReliefOrgVerificationRequests();
  }

  @Patch(['change-role/volunteer/:userId', '/change-role/volunteer/:userId'])
  @Post(['change-role/volunteer/:userId', '/change-role/volunteer/:userId'])
  @ApiOperation({
    summary:
      'Change user role to volunteer and verify volunteer status in volunteer table',
  })
  @ApiParam({ name: 'userId', description: 'User UUID or Auth UUID' })
  @ResponseMessage('Role changed to volunteer and volunteer verified successfully')
  changeRoleToVolunteer(@Param('userId') userId: string) {
    return this.adminService.changeRoleToVolunteer(userId);
  }

  @Patch(['change-role/relief-org/:userId', '/change-role/relief-org/:userId'])
  @Post(['change-role/relief-org/:userId', '/change-role/relief-org/:userId'])
  @ApiOperation({
    summary:
      'Change user role to relief-org and set admin_verified to true in relief_org table',
  })
  @ApiParam({ name: 'userId', description: 'User UUID or Auth UUID' })
  @ResponseMessage('Role changed to relief-org and organization verified successfully')
  changeRoleToReliefOrg(@Param('userId') userId: string) {
    return this.adminService.changeRoleToReliefOrg(userId);
  }

  @Patch(['change-role/admin/:userId', '/change-role/admin/:userId'])
  @Post(['change-role/admin/:userId', '/change-role/admin/:userId'])
  @ApiOperation({ summary: 'Change user role to admin' })
  @ApiParam({ name: 'userId', description: 'User UUID or Auth UUID' })
  @ResponseMessage('Role changed to admin successfully')
  changeRoleToAdmin(@Param('userId') userId: string) {
    return this.adminService.changeRoleToAdmin(userId);
  }

  @Get('tables')
  @ApiOperation({ summary: 'Admin view list of all database tables and counts' })
  @ResponseMessage('Database tables retrieved successfully')
  getAllTables() {
    return this.adminService.getAllTables();
  }

  @Get('tables/:tableName')
  @ApiOperation({ summary: 'Admin view data of any specific database table' })
  @ApiParam({ name: 'tableName', description: 'Table name or Entity name' })
  @ResponseMessage('Table data retrieved successfully')
  getTableData(@Param('tableName') tableName: string) {
    return this.adminService.getTableData(tableName);
  }

  @Get('users')
  @ApiOperation({ summary: 'Admin view all users' })
  @ResponseMessage('Users retrieved successfully')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('volunteers')
  @ApiOperation({ summary: 'Admin view all volunteers' })
  @ResponseMessage('Volunteers retrieved successfully')
  getAllVolunteers() {
    return this.adminService.getAllVolunteers();
  }

  @Get('relief-orgs')
  @ApiOperation({ summary: 'Admin view all relief organizations' })
  @ResponseMessage('Relief organizations retrieved successfully')
  getAllReliefOrgs() {
    return this.adminService.getAllReliefOrgs();
  }

  @Get('disasters')
  @ApiOperation({ summary: 'Admin view all disasters' })
  @ResponseMessage('Disasters retrieved successfully')
  getAllDisasters() {
    return this.adminService.getAllDisasters();
  }

  @Get('shelters')
  @ApiOperation({ summary: 'Admin view all shelters' })
  @ResponseMessage('Shelters retrieved successfully')
  getAllShelters() {
    return this.adminService.getAllShelters();
  }

  @Get('rescue-requests')
  @ApiOperation({ summary: 'Admin view all rescue requests' })
  @ResponseMessage('Rescue requests retrieved successfully')
  getAllRescueRequests() {
    return this.adminService.getAllRescueRequests();
  }

  @Get('missing-persons')
  @ApiOperation({ summary: 'Admin view all missing persons' })
  @ResponseMessage('Missing persons retrieved successfully')
  getAllMissingPersons() {
    return this.adminService.getAllMissingPersons();
  }

  @Get('campaigns')
  @ApiOperation({ summary: 'Admin view all campaigns' })
  @ResponseMessage('Campaigns retrieved successfully')
  getAllCampaigns() {
    return this.adminService.getAllCampaigns();
  }

  @Get('community-posts')
  @ApiOperation({ summary: 'Admin view all community posts' })
  @ResponseMessage('Community posts retrieved successfully')
  getAllCommunityPosts() {
    return this.adminService.getAllCommunityPosts();
  }
}
