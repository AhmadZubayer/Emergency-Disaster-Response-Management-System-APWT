import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReliefOrg } from './entities/relief-org.entity';
import { SignUpReliefOrgDto } from './dto/sign-up-relief-org.dto';
import { FilesService } from 'src/files/files.service';
import { MailerService } from 'src/mailer/mailer.service';
import { Auth } from 'src/auth/entities/auth.entity';
import { USER_ROLE } from 'src/auth/types/user-roles.type';
import { CustomLoggerService } from 'src/common/logger/logger.service';
import { AuditService } from 'src/common/audit/audit.service';
import { EntityNotFoundException } from 'src/common/exceptions/entity-not-found.exception';
import { ResourceConflictException } from 'src/common/exceptions/resource-conflict.exception';

@Injectable()
export class ReliefOrgService {
  private readonly logger = new CustomLoggerService(ReliefOrgService.name);

  constructor(
    @InjectRepository(ReliefOrg)
    private readonly reliefOrgRepo: Repository<ReliefOrg>,
    @InjectRepository(Auth)
    private readonly authRepo: Repository<Auth>,
    private readonly filesService: FilesService,
    private readonly mailerService: MailerService,
    private readonly auditService: AuditService,
  ) {}

  async signUpAsReliefOrg(
    userId: string,
    dto: SignUpReliefOrgDto,
    file?: Express.Multer.File,
  ): Promise<ReliefOrg> {
    if (!file) {
      throw new BadRequestException('Verification document (PDF format) is required');
    }

    const existingUserOrg = await this.reliefOrgRepo.findOne({
      where: { user_id: userId },
    });
    if (existingUserOrg) {
      this.logger.warn(`Relief Org sign up conflict for user_id: ${userId}`);
      throw new ResourceConflictException(
        'A relief organization registration already exists for this user account',
      );
    }

    const existingRegNum = await this.reliefOrgRepo.findOne({
      where: { registration_number: dto.registration_number },
    });
    if (existingRegNum) {
      this.logger.warn(`Relief Org registration number conflict: ${dto.registration_number}`);
      throw new ResourceConflictException(
        'A relief organization with this registration number already exists',
      );
    }

    const uploadedUrls = await this.filesService.saveFiles([file], {
      subFolder: '/relief-org-docs',
      allowedMimeTypes: ['application/pdf'],
      customFileName: `relief-org-doc-${userId}-${Date.now()}`,
    });

    const reliefOrg = this.reliefOrgRepo.create({
      user_id: userId,
      organization_name: dto.organization_name,
      registration_number: dto.registration_number,
      address: dto.address,
      website: dto.website || null,
      description: dto.description || null,
      organization_type: dto.organization_type || null,
      verification_doc: uploadedUrls[0],
      admin_verified: false,
    });

    this.auditService.setCreated(reliefOrg, userId);
    this.logger.log(`Signed up relief org application for: ${reliefOrg.organization_name}`);
    return this.reliefOrgRepo.save(reliefOrg);
  }

  async verifyReliefOrg(orgId: string): Promise<ReliefOrg> {
    const reliefOrg = await this.reliefOrgRepo.findOne({
      where: { id: orgId },
      relations: { user: { auth: true } },
    });

    if (!reliefOrg) {
      throw new EntityNotFoundException('Relief Organization', orgId);
    }

    reliefOrg.admin_verified = true;
    this.auditService.setUpdated(reliefOrg);
    const savedOrg = await this.reliefOrgRepo.save(reliefOrg);

    const userAuth = await this.authRepo.findOne({
      where: { user_id: reliefOrg.user_id },
    });

    if (userAuth) {
      userAuth.role = USER_ROLE.RELIEF_ORG;
      this.auditService.setUpdated(userAuth);
      await this.authRepo.save(userAuth);

      await this.mailerService.sendReliefOrgVerificationEmail(
        userAuth.email,
        reliefOrg.organization_name,
      );
    }

    this.logger.log(`Verified relief org ID: ${orgId}`);
    return savedOrg;
  }

  async getMyProfile(userId: string): Promise<ReliefOrg> {
    const org = await this.reliefOrgRepo.findOne({
      where: { user_id: userId },
      relations: { shelters: true },
    });
    if (!org) {
      throw new EntityNotFoundException('Relief Organization Profile', userId);
    }
    return org;
  }

  async getById(id: string): Promise<ReliefOrg> {
    const org = await this.reliefOrgRepo.findOne({
      where: { id },
      relations: { shelters: true },
    });
    if (!org) {
      throw new EntityNotFoundException('Relief Organization', id);
    }
    return org;
  }

  async getAll(): Promise<ReliefOrg[]> {
    return this.reliefOrgRepo.find({
      relations: { shelters: true },
      order: { created_at: 'DESC' },
    });
  }
}
