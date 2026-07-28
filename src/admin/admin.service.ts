import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Auth } from 'src/auth/entities/auth.entity';
import { Users } from 'src/users/entities/users.entity';
import { Volunteer } from 'src/volunteers/entities/volunteer.entity';
import { ReliefOrg } from 'src/relief-org/entities/relief-org.entity';
import { Disaster } from 'src/disaster/entities/disaster.entity';
import { Shelter } from 'src/shelter/entities/shelter.entity';
import { RescueRequest } from 'src/rescue-requests/entities/rescue-request.entity';
import { MissingPerson } from 'src/missing-persons/entities/missing-person.entity';
import { DonationCampaign } from 'src/donations/entities/campaign.entity';
import { CommunityPost } from 'src/community-posts/entities/community-post.entity';
import { USER_ROLE } from 'src/auth/types/user-roles.type';
import { VolunteerSkill, VolunteerVerificationStatus } from 'src/volunteers/enums/volunteer-status.enum';
import { CustomLoggerService } from 'src/common/logger/logger.service';
import { AuditService } from 'src/common/audit/audit.service';
import { EntityNotFoundException } from 'src/common/exceptions/entity-not-found.exception';

@Injectable()
export class AdminService {
  private readonly logger = new CustomLoggerService(AdminService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Auth)
    private readonly authRepo: Repository<Auth>,
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,
    @InjectRepository(Volunteer)
    private readonly volunteerRepo: Repository<Volunteer>,
    @InjectRepository(ReliefOrg)
    private readonly reliefOrgRepo: Repository<ReliefOrg>,
    @InjectRepository(Disaster)
    private readonly disasterRepo: Repository<Disaster>,
    @InjectRepository(Shelter)
    private readonly shelterRepo: Repository<Shelter>,
    @InjectRepository(RescueRequest)
    private readonly rescueRequestRepo: Repository<RescueRequest>,
    @InjectRepository(MissingPerson)
    private readonly missingPersonRepo: Repository<MissingPerson>,
    @InjectRepository(DonationCampaign)
    private readonly campaignRepo: Repository<DonationCampaign>,
    @InjectRepository(CommunityPost)
    private readonly communityPostRepo: Repository<CommunityPost>,
    private readonly auditService: AuditService,
  ) {}

  private async findAuthByUserIdOrId(userId: string): Promise<Auth> {
    let auth = await this.authRepo.findOne({
      where: { user_id: userId },
      relations: { user: true },
    });
    if (!auth) {
      auth = await this.authRepo.findOne({
        where: { id: userId },
        relations: { user: true },
      });
    }
    if (!auth) {
      this.logger.warn(`User lookup failed for ID: ${userId}`);
      throw new EntityNotFoundException('User', userId);
    }
    return auth;
  }

  async getVolunteerVerificationRequests() {
    this.logger.log('Fetching volunteer verification requests');
    return this.volunteerRepo.find({
      relations: { user: true },
      order: { created_at: 'DESC' },
    });
  }

  async getReliefOrgVerificationRequests() {
    this.logger.log('Fetching relief organization verification requests');
    return this.reliefOrgRepo.find({
      relations: { user: true },
      order: { created_at: 'DESC' },
    });
  }

  async changeRoleToVolunteer(userId: string) {
    const auth = await this.findAuthByUserIdOrId(userId);

    auth.role = USER_ROLE.VOLUNTEER;
    this.auditService.setUpdated(auth);
    await this.authRepo.save(auth);

    let volunteer = await this.volunteerRepo.findOne({
      where: { user_id: auth.user_id },
    });

    if (volunteer) {
      volunteer.verification_status = VolunteerVerificationStatus.VERIFIED;
      volunteer.available = true;
      this.auditService.setUpdated(volunteer);
      volunteer = await this.volunteerRepo.save(volunteer);
    } else {
      volunteer = this.volunteerRepo.create({
        user_id: auth.user_id,
        skills: [VolunteerSkill.OTHER],
        why_join: 'Role updated to volunteer by admin',
        verification_status: VolunteerVerificationStatus.VERIFIED,
        available: true,
        on_duty: false,
      });
      this.auditService.setCreated(volunteer);
      volunteer = await this.volunteerRepo.save(volunteer);
    }

    this.logger.log(`Changed role to volunteer for user_id: ${auth.user_id}`);
    return {
      message: 'Role changed to volunteer successfully, and volunteer verification set to verified',
      user_id: auth.user_id,
      role: auth.role,
      volunteer,
    };
  }

  async changeRoleToReliefOrg(userId: string) {
    const auth = await this.findAuthByUserIdOrId(userId);

    auth.role = USER_ROLE.RELIEF_ORG;
    this.auditService.setUpdated(auth);
    await this.authRepo.save(auth);

    let reliefOrg = await this.reliefOrgRepo.findOne({
      where: { user_id: auth.user_id },
    });

    if (reliefOrg) {
      reliefOrg.admin_verified = true;
      this.auditService.setUpdated(reliefOrg);
      reliefOrg = await this.reliefOrgRepo.save(reliefOrg);
    } else {
      const emailPrefix = auth.email ? auth.email.split('@')[0] : 'Organization';
      reliefOrg = this.reliefOrgRepo.create({
        user_id: auth.user_id,
        organization_name: `Relief Org (${emailPrefix})`,
        registration_number: `REG-${Date.now()}`,
        address: 'N/A',
        verification_doc: 'N/A',
        admin_verified: true,
      });
      this.auditService.setCreated(reliefOrg);
      reliefOrg = await this.reliefOrgRepo.save(reliefOrg);
    }

    this.logger.log(`Changed role to relief_org for user_id: ${auth.user_id}`);
    return {
      message: 'Role changed to relief_org successfully, and organization set to admin verified',
      user_id: auth.user_id,
      role: auth.role,
      relief_org: reliefOrg,
    };
  }

  async changeRoleToAdmin(userId: string) {
    const auth = await this.findAuthByUserIdOrId(userId);

    auth.role = USER_ROLE.ADMIN;
    this.auditService.setUpdated(auth);
    await this.authRepo.save(auth);

    this.logger.log(`Changed role to admin for user_id: ${auth.user_id}`);
    return {
      message: 'Role changed to admin successfully',
      user_id: auth.user_id,
      role: auth.role,
    };
  }

  async getAllTables() {
    this.logger.log('Fetching database tables metadata');
    const entityMetadatas = this.dataSource.entityMetadatas;
    const tables: Array<{ tableName: string; entityName: string; rowCount: number }> = [];

    for (const meta of entityMetadatas) {
      const count = await this.dataSource.getRepository(meta.target).count();
      tables.push({
        tableName: meta.tableName,
        entityName: meta.name,
        rowCount: count,
      });
    }

    return tables;
  }

  async getTableData(tableName: string) {
    this.logger.log(`Fetching table data for table/entity: ${tableName}`);
    const meta = this.dataSource.entityMetadatas.find(
      (m) =>
        m.tableName.toLowerCase() === tableName.toLowerCase() ||
        m.name.toLowerCase() === tableName.toLowerCase(),
    );

    if (!meta) {
      this.logger.warn(`Table or entity not found: ${tableName}`);
      throw new EntityNotFoundException('Database Table', tableName);
    }

    return this.dataSource.getRepository(meta.target).find();
  }

  async getAllUsers() {
    return this.usersRepo.find({ relations: { auth: true } });
  }

  async getAllVolunteers() {
    return this.volunteerRepo.find({ relations: { user: true } });
  }

  async getAllReliefOrgs() {
    return this.reliefOrgRepo.find({ relations: { user: true } });
  }

  async getAllDisasters() {
    return this.disasterRepo.find();
  }

  async getAllShelters() {
    return this.shelterRepo.find();
  }

  async getAllRescueRequests() {
    return this.rescueRequestRepo.find();
  }

  async getAllMissingPersons() {
    return this.missingPersonRepo.find();
  }

  async getAllCampaigns() {
    return this.campaignRepo.find();
  }

  async getAllCommunityPosts() {
    return this.communityPostRepo.find();
  }
}
