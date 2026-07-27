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
  ApiQuery,
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
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';

@ApiTags('Donations & Financial Aid')
@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Get('campaigns')
  @ResponseMessage('Donation campaigns retrieved successfully')
  async getCampaigns() {
    return this.donationsService.getCampaigns();
  }

  @Get('campaigns/:id')
  @ResponseMessage('Donation campaign details retrieved successfully')
  async getCampaignById(@Param('id') id: string) {
    return this.donationsService.getCampaignById(id);
  }

  @Post('campaigns/:id/donate')
  @ResponseMessage('Donation session created successfully')
  async initiateDonation(
    @Param('id') campaignId: string,
    @Body() dto: CreateDonationDto,
    @CurrentUser() user?: any,
  ) {
    return this.donationsService.initiateDonation(campaignId, dto, user);
  }

  @Get('payment/success')
  @ResponseMessage('Payment verified and completed successfully')
  async handlePaymentSuccess(
    @Query('session_id') sessionId: string,
    @Query('tx_id') txId: string,
  ) {
    return this.donationsService.handlePaymentSuccess(sessionId, txId);
  }

  @Get('payment/cancel')
  @ApiQuery({ name: 'tx_id', required: true })
  @ResponseMessage('Payment process cancelled')
  async handlePaymentCancel(@Query('tx_id') txId: string) {
    return this.donationsService.handlePaymentCancel(txId);
  }

  @Post('campaigns/:id/apply')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ResponseMessage('Aid application submitted successfully')
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
  @ResponseMessage('User aid applications retrieved successfully')
  async getUserApplications(@CurrentUser('id') userId: string) {
    return this.donationsService.getUserApplications(userId);
  }

  @Get('applications')
  @UseGuards(JwtGuard, RolesGuard)
  @roles(USER_ROLE.RELIEF_ORG, USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @ResponseMessage('All aid applications retrieved successfully')
  async getAllApplications() {
    return this.donationsService.getAllApplications();
  }

  @Patch('applications/:id/review')
  @UseGuards(JwtGuard, RolesGuard)
  @roles(USER_ROLE.RELIEF_ORG, USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @ResponseMessage('Aid application reviewed successfully')
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
