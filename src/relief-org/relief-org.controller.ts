import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { ReliefOrgService } from './relief-org.service';

import { CreateReliefOrgDto } from './dto/create-relief-org.dto';
import { UpdateReliefOrgDto } from './dto/update-relief-org.dto';
import { VerifyReliefOrgDto } from './dto/verify-relief-org.dto';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';
import { CreateShelterDto } from './dto/create-shelter.dto';
import { UpdateShelterDto } from './dto/update-shelter.dto';

// Teammate-এর Auth module থেকে Guards ও Decorators import
import { JwtGuard } from 'src/auth/guards/access-jwt-guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('Relief Organization')
@ApiBearerAuth()                  // Swagger-এ Bearer token field দেখাবে
@UseGuards(JwtGuard, RolesGuard)  // সব route-এ JWT চেক হবে
@Controller('relief-org')
export class ReliefOrgController {
  constructor(private readonly reliefOrgService: ReliefOrgService) {}

  // ─────────────────────────────────────────────
  // RELIEF ORG — Profile & Verification
  // ─────────────────────────────────────────────

  /**
   * POST /relief-org/register
   * শুধু relief_org role-এর user register করতে পারবে
   */
  @Post('register')
  @roles('relief_org')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new Relief Organization (relief_org role required)' })
  @ApiResponse({ status: 201, description: 'Organization registered. Status is pending.' })
  @ApiResponse({ status: 401, description: 'Unauthorized — JWT token missing or invalid.' })
  @ApiResponse({ status: 403, description: 'Forbidden — wrong role.' })
  @ApiResponse({ status: 409, description: 'Organization already exists for this user.' })
  register(
    @CurrentUser('id') userId: string,  // JWT token থেকে automatically user id পাওয়া যাবে
    @Body() dto: CreateReliefOrgDto,
  ) {
    return this.reliefOrgService.register(userId, dto);
  }

  /**
   * GET /relief-org/:id
   * যেকোনো authenticated user দেখতে পারবে
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a Relief Organization by ID' })
  @ApiParam({ name: 'id', description: 'UUID of the Relief Organization' })
  @ApiResponse({ status: 200, description: 'Organization found.' })
  @ApiResponse({ status: 404, description: 'Organization not found.' })
  findById(@Param('id') id: string) {
    return this.reliefOrgService.findById(id);
  }

  /**
   * PATCH /relief-org/:id
   * শুধু relief_org role update করতে পারবে
   */
  @Patch(':id')
  @roles('relief_org')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update Relief Organization info (relief_org role required)' })
  @ApiParam({ name: 'id', description: 'UUID of the Relief Organization' })
  @ApiResponse({ status: 200, description: 'Organization updated.' })
  @ApiResponse({ status: 404, description: 'Organization not found.' })
  updateOrg(@Param('id') id: string, @Body() dto: UpdateReliefOrgDto) {
    return this.reliefOrgService.updateOrg(id, dto);
  }

  /**
   * PATCH /relief-org/:id/verify
   * শুধু admin verify করতে পারবে
   */
  @Patch(':id/verify')
  @roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update verification status (admin role required)' })
  @ApiParam({ name: 'id', description: 'UUID of the Relief Organization' })
  @ApiResponse({ status: 200, description: 'Verification status updated.' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin role required.' })
  @ApiResponse({ status: 404, description: 'Organization not found.' })
  verifyOrg(@Param('id') id: string, @Body() dto: VerifyReliefOrgDto) {
    return this.reliefOrgService.verifyOrg(id, dto);
  }

  /**
   * GET /relief-org/:id/report
   * শুধু relief_org দেখতে পারবে
   */
  @Get(':id/report')
  @roles('relief_org')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get operations report (relief_org role required)' })
  @ApiParam({ name: 'id', description: 'UUID of the Relief Organization' })
  @ApiResponse({ status: 200, description: 'Report generated.' })
  @ApiResponse({ status: 404, description: 'Organization not found.' })
  getReport(@Param('id') id: string) {
    return this.reliefOrgService.getReport(id);
  }

  // ─────────────────────────────────────────────
  // DONATIONS
  // ─────────────────────────────────────────────

  @Post(':id/donations')
  @roles('relief_org')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record a new donation (relief_org role required)' })
  @ApiParam({ name: 'id', description: 'UUID of the Relief Organization' })
  @ApiResponse({ status: 201, description: 'Donation recorded.' })
  @ApiResponse({ status: 404, description: 'Organization not found.' })
  createDonation(@Param('id') orgId: string, @Body() dto: CreateDonationDto) {
    return this.reliefOrgService.createDonation(orgId, dto);
  }

  @Get(':id/donations')
  @roles('relief_org')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all donations (relief_org role required)' })
  @ApiParam({ name: 'id', description: 'UUID of the Relief Organization' })
  @ApiResponse({ status: 200, description: 'List of donations.' })
  getDonations(@Param('id') orgId: string) {
    return this.reliefOrgService.getDonations(orgId);
  }

  @Patch(':id/donations/:donationId')
  @roles('relief_org')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update donation status (relief_org role required)' })
  @ApiParam({ name: 'id', description: 'UUID of the Relief Organization' })
  @ApiParam({ name: 'donationId', description: 'UUID of the Donation' })
  @ApiResponse({ status: 200, description: 'Donation status updated.' })
  @ApiResponse({ status: 404, description: 'Donation not found.' })
  updateDonation(
    @Param('id') orgId: string,
    @Param('donationId') donationId: string,
    @Body() dto: UpdateDonationDto,
  ) {
    return this.reliefOrgService.updateDonation(orgId, donationId, dto);
  }

  // ─────────────────────────────────────────────
  // SHELTERS
  // ─────────────────────────────────────────────

  @Post(':id/shelters')
  @roles('relief_org')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new shelter (relief_org role required)' })
  @ApiParam({ name: 'id', description: 'UUID of the Relief Organization' })
  @ApiResponse({ status: 201, description: 'Shelter created.' })
  createShelter(@Param('id') orgId: string, @Body() dto: CreateShelterDto) {
    return this.reliefOrgService.createShelter(orgId, dto);
  }

  @Get(':id/shelters')
  @roles('relief_org')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all shelters (relief_org role required)' })
  @ApiParam({ name: 'id', description: 'UUID of the Relief Organization' })
  @ApiResponse({ status: 200, description: 'List of shelters.' })
  getShelters(@Param('id') orgId: string) {
    return this.reliefOrgService.getShelters(orgId);
  }

  @Patch(':id/shelters/:shelterId')
  @roles('relief_org')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update shelter info/capacity (relief_org role required)' })
  @ApiParam({ name: 'id', description: 'UUID of the Relief Organization' })
  @ApiParam({ name: 'shelterId', description: 'UUID of the Shelter' })
  @ApiResponse({ status: 200, description: 'Shelter updated.' })
  @ApiResponse({ status: 400, description: 'Occupancy exceeds capacity.' })
  @ApiResponse({ status: 404, description: 'Shelter not found.' })
  updateShelter(
    @Param('id') orgId: string,
    @Param('shelterId') shelterId: string,
    @Body() dto: UpdateShelterDto,
  ) {
    return this.reliefOrgService.updateShelter(orgId, shelterId, dto);
  }

  @Delete(':id/shelters/:shelterId')
  @roles('relief_org')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a shelter (relief_org role required)' })
  @ApiParam({ name: 'id', description: 'UUID of the Relief Organization' })
  @ApiParam({ name: 'shelterId', description: 'UUID of the Shelter' })
  @ApiResponse({ status: 200, description: 'Shelter deleted.' })
  @ApiResponse({ status: 404, description: 'Shelter not found.' })
  deleteShelter(@Param('id') orgId: string, @Param('shelterId') shelterId: string) {
    return this.reliefOrgService.deleteShelter(orgId, shelterId);
  }
}
