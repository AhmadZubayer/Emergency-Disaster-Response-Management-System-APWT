import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { MailerService } from 'src/mailer/mailer.service';
import { FilesService } from 'src/files/files.service';
import { StripePaymentException } from 'src/common/exceptions/stripe-payment.exception';
import { CustomLoggerService } from 'src/common/logger/logger.service';
import { AuditService } from 'src/common/audit/audit.service';
import {
  DonationApplication,
  DonationCampaign,
  DonationTransaction,
} from './entities';
import {
  ApplicationStatus,
  CampaignStatus,
  PaymentGateway,
  TransactionStatus,
  TransactionType,
} from './enums';
import {
  CreateApplicationDto,
  CreateCampaignDto,
  CreateDonationDto,
  ReviewApplicationDto,
  UpdateCampaignDto,
} from './dto';

@Injectable()
export class DonationsService {
  private readonly logger = new CustomLoggerService(DonationsService.name);
  private stripe: Stripe;

  constructor(
    @InjectRepository(DonationCampaign)
    private readonly campaignRepository: Repository<DonationCampaign>,
    @InjectRepository(DonationTransaction)
    private readonly transactionRepository: Repository<DonationTransaction>,
    @InjectRepository(DonationApplication)
    private readonly applicationRepository: Repository<DonationApplication>,
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly auditService: AuditService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (stripeSecretKey) {
      this.stripe = new Stripe(stripeSecretKey);
    }
  }

  async getCampaigns(): Promise<DonationCampaign[]> {
    return this.campaignRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async getCampaignById(id: string): Promise<any> {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
    });
    if (!campaign) {
      throw new NotFoundException('Donation campaign not found');
    }

    const donorsCount = await this.transactionRepository.count({
      where: {
        campaign_id: id,
        status: TransactionStatus.COMPLETED,
      },
    });

    return {
      ...campaign,
      donors_count: donorsCount,
    };
  }

  async createCampaign(
    userId: string,
    dto: CreateCampaignDto,
    file?: Express.Multer.File,
  ): Promise<DonationCampaign> {
    let photoUrl = dto.photo_url || null;

    if (file) {
      const uploadedUrls = await this.filesService.saveFiles([file], {
        subFolder: '/donation-campaign-photos',
        allowedMimeTypes: [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
        ],
      });
      if (uploadedUrls.length > 0) {
        photoUrl = uploadedUrls[0];
      }
    }

    const campaign = this.campaignRepository.create({
      title: dto.title,
      description: dto.description,
      target_amount: dto.target_amount,
      raised_amount: 0,
      photo_url: photoUrl,
      start_date: new Date(dto.start_date),
      end_date: new Date(dto.end_date),
      status: dto.status || CampaignStatus.ACTIVE,
      created_by_user_id: userId,
    });

    this.auditService.setCreated(campaign, userId);
    return await this.campaignRepository.save(campaign);
  }

  async updateCampaign(
    userId: string,
    id: string,
    dto: UpdateCampaignDto,
    file?: Express.Multer.File,
  ): Promise<DonationCampaign> {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
    });
    if (!campaign) {
      throw new NotFoundException('Donation campaign not found');
    }

    if (file) {
      const uploadedUrls = await this.filesService.saveFiles([file], {
        subFolder: '/donation-campaign-photos',
        allowedMimeTypes: [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
        ],
      });
      if (uploadedUrls.length > 0) {
        campaign.photo_url = uploadedUrls[0];
      }
    } else if (dto.photo_url !== undefined) {
      campaign.photo_url = dto.photo_url;
    }

    if (dto.title) campaign.title = dto.title;
    if (dto.description) campaign.description = dto.description;
    if (dto.target_amount !== undefined) campaign.target_amount = dto.target_amount;
    if (dto.start_date) campaign.start_date = new Date(dto.start_date);
    if (dto.end_date) campaign.end_date = new Date(dto.end_date);
    if (dto.status) campaign.status = dto.status;

    this.auditService.setUpdated(campaign, userId);
    return await this.campaignRepository.save(campaign);
  }

  async deleteCampaign(
    userId: string,
    id: string,
  ): Promise<DonationCampaign> {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
    });
    if (!campaign) {
      throw new NotFoundException('Donation campaign not found');
    }
    return await this.campaignRepository.remove(campaign);
  }

  async initiateDonation(
    campaignId: string,
    dto: CreateDonationDto,
    currentUser?: any,
  ) {
    const campaign = await this.getCampaignById(campaignId);

    const transactionId = `TXN_DONATE_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;

    const isAnonymous = dto.is_anonymous ?? false;
    const userId = currentUser?.id || currentUser?.userId || null;
    const donorName = isAnonymous
      ? 'Anonymous Donor'
      : dto.donor_name || currentUser?.name || 'Valued Donor';
    const donorEmail = isAnonymous
      ? null
      : dto.donor_email || currentUser?.email || null;

    const transaction = this.transactionRepository.create({
      campaign_id: campaign.id,
      transaction_type: TransactionType.DONATE,
      user_id: userId,
      is_anonymous: isAnonymous,
      user_name: donorName,
      user_email: donorEmail,
      amount: dto.amount,
      payment_gateway: dto.payment_gateway || PaymentGateway.STRIPE,
      transaction_id: transactionId,
      status: TransactionStatus.PENDING,
    });

    this.auditService.setCreated(transaction, userId);
    await this.transactionRepository.save(transaction);

    this.logger.logBusinessEvent('Donation initiated', 'DonationsService', {
      transactionId,
      campaignId: campaign.id,
      amount: dto.amount,
    });

    let baseUrl =
      this.configService.get<string>('CLIENT_URL') ||
      this.configService.get<string>('FRONTEND_URL') ||
      this.configService.get<string>('APP_URL') ||
      'http://localhost:3000';

    if (baseUrl.includes(':5000')) {
      baseUrl = baseUrl.replace(':5000', ':3000');
    }

    if (!this.stripe) {
      const stripeSecretKey =
        this.configService.get<string>('STRIPE_SECRET_KEY');
      if (stripeSecretKey) {
        this.stripe = new Stripe(stripeSecretKey);
      } else {
        this.logger.logError('Stripe secret key is missing in config');
        throw new BadRequestException(
          'Stripe secret key is not configured in .env (STRIPE_SECRET_KEY)',
        );
      }
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Donation: ${campaign.title}`,
                description: `Emergency fund contribution reference: ${transactionId}`,
              },
              unit_amount: Math.round(dto.amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${baseUrl}/donations/${campaign.id}?payment=success&session_id={CHECKOUT_SESSION_ID}&tx_id=${transactionId}`,
        cancel_url: `${baseUrl}/donations/${campaign.id}?payment=cancelled&tx_id=${transactionId}`,
        metadata: {
          transaction_id: transactionId,
          campaign_id: campaign.id,
        },
      });

      transaction.gateway_tx_id = session.id;
      this.auditService.setUpdated(transaction, userId);
      await this.transactionRepository.save(transaction);

      return {
        message: 'Donation session created successfully',
        checkout_url: session.url,
        transaction_id: transactionId,
      };
    } catch (error: any) {
      this.logger.logError('Stripe payment failed', error.stack, 'DonationsService');
      transaction.status = TransactionStatus.FAILED;
      await this.transactionRepository.save(transaction);
      if (error && typeof error === 'object' && error instanceof Stripe.errors.StripeError) {
        throw new StripePaymentException(error.message, error.statusCode || 400);
      }
      throw error;
    }
  }

  async handlePaymentSuccess(sessionId: string, txId: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { transaction_id: txId },
      relations: { campaign: { creator: true }, user: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status === TransactionStatus.COMPLETED) {
      return {
        status: 'success',
        message: 'Payment already verified and completed',
        transaction_id: transaction.transaction_id,
        amount: Number(transaction.amount),
        paid_at: transaction.paid_at || new Date(),
        payment_gateway: transaction.payment_gateway,
        is_anonymous: transaction.is_anonymous,
        donor_name: transaction.is_anonymous ? 'Anonymous Donor' : (transaction.user_name || transaction.user?.name || 'Valued Donor'),
        donor_contact: transaction.is_anonymous ? 'Anonymous' : (transaction.user_email || transaction.user?.phone || 'N/A'),
        campaign_title: transaction.campaign?.title || 'Emergency Relief Fund',
        relief_org: transaction.campaign?.creator?.name || 'Emergency Disaster Response Management System',
      };
    }

    if (!this.stripe) {
      const stripeSecret = this.configService.get<string>('STRIPE_SECRET_KEY');
      if (stripeSecret) {
        this.stripe = new Stripe(stripeSecret);
      }
    }

    if (sessionId && this.stripe) {
      try {
        const session = await this.stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status !== 'paid') {
          transaction.status = TransactionStatus.FAILED;
          await this.transactionRepository.save(transaction);
          this.logger.logWarning(`Stripe session unpaid for transaction ${txId}`);
          throw new BadRequestException('Payment was not completed on Stripe');
        }
      } catch (error: any) {
        this.logger.logError('Stripe session verification failed', error.stack, 'DonationsService');
        throw error;
      }
    }

    transaction.status = TransactionStatus.COMPLETED;
    transaction.paid_at = new Date();
    this.auditService.setUpdated(transaction, transaction.user_id);
    await this.transactionRepository.save(transaction);

    this.logger.logBusinessEvent('Donation completed', 'DonationsService', {
      transactionId: transaction.transaction_id,
      amount: transaction.amount,
    });

    const campaign = await this.campaignRepository.findOne({
      where: { id: transaction.campaign_id },
      relations: { creator: true },
    });
    if (campaign) {
      campaign.raised_amount =
        Number(campaign.raised_amount) + Number(transaction.amount);
      this.auditService.setUpdated(campaign, transaction.user_id);
      await this.campaignRepository.save(campaign);
    }

    if (!transaction.is_anonymous && transaction.user_email) {
      try {
        await this.mailerService.sendDonationReceiptEmail(
          transaction.user_email,
          transaction.user_name || 'Valued Supporter',
          Number(transaction.amount),
          campaign?.title || 'Relief Fund',
          transaction.transaction_id,
        );
      } catch (error: any) {
        this.logger.logError('Failed to send donation receipt email', error?.stack, 'DonationsService');
      }
    }

    return {
      status: 'success',
      message: 'Donation successfully completed! Thank you for your support.',
      transaction_id: transaction.transaction_id,
      amount: Number(transaction.amount),
      paid_at: transaction.paid_at || new Date(),
      payment_gateway: transaction.payment_gateway,
      is_anonymous: transaction.is_anonymous,
      donor_name: transaction.is_anonymous ? 'Anonymous Donor' : (transaction.user_name || transaction.user?.name || 'Valued Donor'),
      donor_contact: transaction.is_anonymous ? 'Anonymous' : (transaction.user_email || transaction.user?.phone || 'N/A'),
      campaign_title: campaign?.title || transaction.campaign?.title || 'Emergency Relief Fund',
      relief_org: campaign?.creator?.name || transaction.campaign?.creator?.name || 'Emergency Disaster Response Management System',
    };
  }

  async handlePaymentCancel(txId: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { transaction_id: txId },
    });
    if (transaction && transaction.status === TransactionStatus.PENDING) {
      transaction.status = TransactionStatus.CANCELLED;
      this.auditService.setUpdated(transaction, transaction.user_id);
      await this.transactionRepository.save(transaction);
    }
    return {
      status: 'cancelled',
      message: 'Payment process was cancelled by the user.',
      transaction_id: txId,
    };
  }

  async applyForAid(
    campaignId: string,
    userId: string,
    dto: CreateApplicationDto,
  ): Promise<DonationApplication> {
    if (!userId) {
      throw new BadRequestException('User ID is required to apply for aid');
    }
    await this.getCampaignById(campaignId);

    const application = this.applicationRepository.create({
      campaign_id: campaignId,
      applicant_id: userId,
      reason: dto.reason,
      payout_details: dto.payout_details,
      proof_document_url: dto.proof_document_url || null,
      status: ApplicationStatus.PENDING,
    });

    this.auditService.setCreated(application, userId);
    const savedApp = await this.applicationRepository.save(application);

    this.logger.logBusinessEvent('Aid application submitted', 'DonationsService', {
      applicationId: savedApp.id,
      campaignId,
      userId,
    });

    return savedApp;
  }

  private formatApplication(app: DonationApplication) {
    return {
      id: app.id,
      campaign_id: app.campaign_id,
      campaign_title: app.campaign?.title || null,
      applicant_id: app.applicant_id,
      applicant_name: app.applicant?.name || null,
      applicant_phone: app.applicant?.phone || null,
      reason: app.reason,
      payout_details: app.payout_details,
      proof_document_url: app.proof_document_url,
      status: app.status,
      approved_amount: app.approved_amount ? Number(app.approved_amount) : null,
      reviewed_by_user_id: app.reviewed_by_user_id,
      reviewed_at: app.reviewed_at,
      created_at: app.created_at,
      updated_at: app.updated_at,
    };
  }

  async getUserApplications(userId: string) {
    const apps = await this.applicationRepository.find({
      where: { applicant_id: userId },
      relations: { campaign: true },
      order: { created_at: 'DESC' },
    });
    return apps.map((app) => this.formatApplication(app));
  }

  async getUserDonations(userId: string) {
    const txs = await this.transactionRepository.find({
      where: { user_id: userId, transaction_type: TransactionType.DONATE },
      relations: { campaign: true },
      order: { created_at: 'DESC' },
    });
    return txs.map((tx) => ({
      id: tx.id,
      campaign_id: tx.campaign_id,
      campaign_title: tx.campaign?.title || 'General Relief Fund',
      amount: Number(tx.amount),
      payment_gateway: tx.payment_gateway,
      transaction_id: tx.transaction_id,
      status: tx.status,
      paid_at: tx.paid_at || tx.created_at,
      created_at: tx.created_at,
    }));
  }

  async getAllApplications() {
    const apps = await this.applicationRepository.find({
      relations: { campaign: true, applicant: true },
      order: { created_at: 'DESC' },
    });
    return apps.map((app) => this.formatApplication(app));
  }

  async reviewApplication(
    applicationId: string,
    reviewerId: string,
    dto: ReviewApplicationDto,
  ) {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: { campaign: true, applicant: { auth: true } },
    });

    if (!application) {
      throw new NotFoundException('Donation application not found');
    }

    if (
      dto.status === ApplicationStatus.APPROVED &&
      (!dto.approved_amount || dto.approved_amount <= 0)
    ) {
      throw new BadRequestException(
        'Approved amount must be specified and greater than 0 when approving an application',
      );
    }

    application.status = dto.status;
    application.reviewed_by_user_id = reviewerId;
    application.reviewed_at = new Date();
    this.auditService.setUpdated(application, reviewerId);

    if (dto.status === ApplicationStatus.APPROVED) {
      application.approved_amount = dto.approved_amount ?? null;

      const txId = `TXN_RECEIVE_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`;

      const receiveTx = this.transactionRepository.create({
        campaign_id: application.campaign_id,
        transaction_type: TransactionType.RECEIVE,
        user_id: application.applicant_id,
        user_name: application.applicant?.name || 'Beneficiary',
        user_email: application.applicant?.auth?.email || null,
        application_id: application.id,
        amount: dto.approved_amount,
        payment_gateway: PaymentGateway.STRIPE,
        transaction_id: txId,
        status: TransactionStatus.COMPLETED,
        paid_at: new Date(),
      });

      this.auditService.setCreated(receiveTx, reviewerId);
      await this.transactionRepository.save(receiveTx);

      const applicantEmail = application.applicant?.auth?.email;
      if (applicantEmail) {
        try {
          await this.mailerService.sendAidApprovalEmail(
            applicantEmail,
            application.applicant.name || 'Valued Citizen',
            Number(dto.approved_amount),
            application.campaign?.title || 'Emergency Fund',
            application.payout_details,
          );
        } catch (err: any) {
          this.logger.logError('Failed to send aid approval email', err?.stack, 'DonationsService');
        }
      }
    }

    const savedApp = await this.applicationRepository.save(application);
    return this.formatApplication(savedApp);
  }
}
