import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DonationsService } from './donations.service';
import {
  CreateApplicationDto,
  CreateDonationDto,
  ReviewApplicationDto,
} from './dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { roles } from 'src/auth/decorators/roles.decorator';
import { JwtGuard } from 'src/auth/guards/access-jwt-guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { USER_ROLE } from 'src/auth/types/user-roles.type';

@ApiTags('Donations & Financial Aid')
@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Get('campaigns')
  @ApiOperation({ summary: 'Get all active donation relief campaigns' })
  @ApiResponse({ status: 200, description: 'List of donation campaigns' })
  async getCampaigns() {
    return this.donationsService.getCampaigns();
  }

  @Get('campaigns/:id')
  @ApiOperation({ summary: 'Get donation campaign details by ID' })
  @ApiResponse({ status: 200, description: 'Campaign details' })
  async getCampaignById(@Param('id') id: string) {
    return this.donationsService.getCampaignById(id);
  }

  @Post('campaigns/:id/donate')
  @ApiOperation({
    summary: 'Initiate a donation to a campaign (Stripe Checkout Session)',
  })
  @ApiResponse({
    status: 201,
    description: 'Returns Stripe checkout session URL for payment',
  })
  async initiateDonation(
    @Param('id') campaignId: string,
    @Body() dto: CreateDonationDto,
    @CurrentUser() user?: any,
  ) {
    return this.donationsService.initiateDonation(campaignId, dto, user);
  }

  @Get('payment/success')
  @ApiOperation({
    summary: 'Stripe Payment Success Redirect callback',
  })
  @ApiQuery({ name: 'session_id', required: false })
  @ApiQuery({ name: 'tx_id', required: true })
  async handlePaymentSuccess(
    @Query('session_id') sessionId: string,
    @Query('tx_id') txId: string,
  ) {
    return this.donationsService.handlePaymentSuccess(sessionId, txId);
  }

  @Get('payment/cancel')
  @ApiOperation({
    summary: 'Stripe Payment Cancel Redirect callback',
  })
  @ApiQuery({ name: 'tx_id', required: true })
  async handlePaymentCancel(@Query('tx_id') txId: string) {
    return this.donationsService.handlePaymentCancel(txId);
  }

  @Post('campaigns/:id/apply')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply for relief funds under a campaign' })
  @ApiResponse({ status: 201, description: 'Application submitted' })
  async applyForAid(
    @Param('id') campaignId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateApplicationDto,
  ) {
    return this.donationsService.applyForAid(campaignId, userId, dto);
  }

  @Get('my-applications')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'View user own submitted aid applications' })
  async getUserApplications(@CurrentUser('id') userId: string) {
    return this.donationsService.getUserApplications(userId);
  }

  @Get('applications')
  @UseGuards(JwtGuard, RolesGuard)
  @roles(USER_ROLE.RELIEF_ORG, USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'View all aid applications (Relief Org / Admin Only)',
  })
  async getAllApplications() {
    return this.donationsService.getAllApplications();
  }

  @Patch('applications/:id/review')
  @UseGuards(JwtGuard, RolesGuard)
  @roles(USER_ROLE.RELIEF_ORG, USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Review & Approve/Reject relief application with approved amount (Relief Org / Admin)',
  })
  async reviewApplication(
    @Param('id') applicationId: string,
    @CurrentUser('id') reviewerId: string,
    @Body() dto: ReviewApplicationDto,
  ) {
    return this.donationsService.reviewApplication(
      applicationId,
      reviewerId,
      dto,
    );
  }
}
