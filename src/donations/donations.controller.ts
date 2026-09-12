import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { DonationsService } from './donations.service';
import {
  CreateApplicationDto,
  CreateCampaignDto,
  CreateDonationDto,
  ReviewApplicationDto,
  UpdateCampaignDto,
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

  @Post('campaigns')
  @UseGuards(JwtGuard, RolesGuard)
  @roles(USER_ROLE.RELIEF_ORG, USER_ROLE.ADMIN)
  @UseInterceptors(FilesInterceptor('file'))
  @ApiBearerAuth()
  @ResponseMessage('Donation campaign created successfully')
  async createCampaign(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCampaignDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const file = files && files.length > 0 ? files[0] : undefined;
    return this.donationsService.createCampaign(userId, dto, file);
  }

  @Patch('campaigns/:id')
  @UseGuards(JwtGuard, RolesGuard)
  @roles(USER_ROLE.RELIEF_ORG, USER_ROLE.ADMIN)
  @UseInterceptors(FilesInterceptor('file'))
  @ApiBearerAuth()
  @ResponseMessage('Donation campaign updated successfully')
  async updateCampaign(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const file = files && files.length > 0 ? files[0] : undefined;
    return this.donationsService.updateCampaign(userId, id, dto, file);
  }

  @Delete('campaigns/:id')
  @UseGuards(JwtGuard, RolesGuard)
  @roles(USER_ROLE.RELIEF_ORG, USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @ResponseMessage('Donation campaign deleted successfully')
  async deleteCampaign(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.donationsService.deleteCampaign(userId, id);
  }

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

  @Get('campaigns/:id/applications')
  @UseGuards(JwtGuard, RolesGuard)
  @roles(USER_ROLE.RELIEF_ORG, USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @ResponseMessage('Campaign aid applications retrieved successfully')
  async getCampaignApplications(@Param('id') id: string) {
    return this.donationsService.getCampaignApplications(id);
  }

  @Get('campaigns/:id/transactions')
  @UseGuards(JwtGuard, RolesGuard)
  @roles(USER_ROLE.RELIEF_ORG, USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @ResponseMessage('Campaign transactions retrieved successfully')
  async getCampaignTransactions(@Param('id') id: string) {
    return this.donationsService.getCampaignTransactions(id);
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
  @UseInterceptors(FilesInterceptor('file'))
  @ApiBearerAuth()
  @ResponseMessage('Aid application submitted successfully')
  async applyForAid(
    @Param('id') campaignId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateApplicationDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const file = files && files.length > 0 ? files[0] : undefined;
    return this.donationsService.applyForAid(campaignId, userId, dto, file);
  }

  @Get('my-applications')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ResponseMessage('User aid applications retrieved successfully')
  async getUserApplications(@CurrentUser('id') userId: string) {
    return this.donationsService.getUserApplications(userId);
  }

  @Get('my-donations')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ResponseMessage('User donations retrieved successfully')
  async getUserDonations(@CurrentUser('id') userId: string) {
    return this.donationsService.getUserDonations(userId);
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
