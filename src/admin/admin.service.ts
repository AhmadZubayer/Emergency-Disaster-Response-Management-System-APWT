import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Auth } from 'src/auth/entities/auth.entity';
import { USER_ROLE } from 'src/auth/types/user-roles.type';
import type { UserRole } from 'src/auth/types/user-roles.type';
import { Users } from 'src/users/entities/users.entity';
import { Volunteer } from 'src/volunteers/entities/volunteer.entity';
import { ReliefOrg } from 'src/relief-org/entities/relief-org.entity';
import { Disaster } from 'src/disaster/entities/disaster.entity';
import { RescueRequest, RescueStatus, UrgencyLevel } from 'src/rescue-requests/entities/rescue-request.entity';
import { CommunityPost } from 'src/community-posts/entities/community-post.entity';
import { PostStatus } from 'src/community-posts/enums/post-status.enum';
import { VolunteerVerificationStatus } from 'src/volunteers/enums/volunteer-status.enum';

type ListQuery = {
  page?: string;
  limit?: string;
};

type AccountQuery = ListQuery & {
  role?: string;
  includeDeleted?: boolean;
};

type VolunteerQuery = ListQuery & {
  status?: string;
};

type ReliefOrgQuery = ListQuery & {
  status?: string;
};

type DisasterQuery = ListQuery & {
  verified?: string;
};

type RescueRequestQuery = ListQuery & {
  status?: string;
};

type CommunityPostQuery = ListQuery & {
  status?: string;
  includeDeleted?: boolean;
};

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Auth) private readonly authRepo: Repository<Auth>,
    @InjectRepository(Users) private readonly usersRepo: Repository<Users>,
    @InjectRepository(Volunteer) private readonly volunteerRepo: Repository<Volunteer>,
    @InjectRepository(ReliefOrg) private readonly reliefOrgRepo: Repository<ReliefOrg>,
    @InjectRepository(Disaster) private readonly disasterRepo: Repository<Disaster>,
    @InjectRepository(RescueRequest) private readonly rescueRequestRepo: Repository<RescueRequest>,
    @InjectRepository(CommunityPost) private readonly communityPostRepo: Repository<CommunityPost>,
    private readonly dataSource: DataSource,
  ) {}

  private getPagination(query: ListQuery) {
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.max(Number(query.limit ?? 10), 1);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  }

  private buildPaginationResult<T>(items: T[], total: number, page: number, limit: number) {
    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    };
  }

  async listAccounts(query: AccountQuery) {
    const { page, limit, skip } = this.getPagination(query);
    const where = query.role ? { role: query.role as UserRole } : undefined;

    const [items, total] = await this.authRepo.findAndCount({
      where,
      relations: { user: true },
      order: { created_at: 'DESC' },
      withDeleted: query.includeDeleted,
      skip,
      take: limit,
    });

    return this.buildPaginationResult(items, total, page, limit);
  }

  async createAccount(dto: { name: string; email: string; password?: string; role?: string; phone?: string }) {
    const existing = await this.authRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password || 'Password123!', 10);
    const user = this.usersRepo.create({
      name: dto.name,
      phone: dto.phone || '+8801700000000',
    });
    const savedUser = await this.usersRepo.save(user);

    const auth = this.authRepo.create({
      user_id: savedUser.id,
      email: dto.email,
      password: passwordHash,
      role: (dto.role?.toLowerCase() as UserRole) || USER_ROLE.USER,
      email_verified: true,
    });
    const savedAuth = await this.authRepo.save(auth);

    return {
      id: savedAuth.id,
      user_id: savedUser.id,
      email: savedAuth.email,
      role: savedAuth.role,
      name: savedUser.name,
    };
  }

  async updateAccountRole(id: string, role: string) {
    const auth = await this.authRepo.findOne({ where: { user_id: id }, withDeleted: true });
    if (!auth) {
      throw new NotFoundException('Account not found');
    }

    const normalizedRole = role.toLowerCase();
    if (!Object.values(USER_ROLE).includes(normalizedRole as UserRole)) {
      throw new BadRequestException('Unsupported role');
    }

    auth.role = normalizedRole as UserRole;
    return this.authRepo.save(auth);
  }

  async softDeleteAccount(id: string) {
    const auth = await this.authRepo.findOne({ where: { user_id: id }, withDeleted: true });
    if (!auth) {
      throw new NotFoundException('Account not found');
    }

    await this.authRepo.softDelete(auth.id);
    await this.usersRepo.softDelete(id);

    return { message: 'Account soft deleted successfully' };
  }

  async restoreAccount(id: string) {
    const auth = await this.authRepo.findOne({ where: { user_id: id }, withDeleted: true });
    if (!auth) {
      throw new NotFoundException('Account not found');
    }

    await this.authRepo.restore(auth.id);
    await this.usersRepo.restore(id);

    return { message: 'Account restored successfully' };
  }

  async listVolunteers(query: VolunteerQuery) {
    const { page, limit, skip } = this.getPagination(query);
    const where = query.status ? { verification_status: query.status as VolunteerVerificationStatus } : undefined;

    const [items, total] = await this.volunteerRepo.findAndCount({
      where,
      relations: { user: true },
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return this.buildPaginationResult(items, total, page, limit);
  }

  async verifyVolunteer(id: string, status: string) {
    const volunteer = await this.volunteerRepo.findOne({ where: { id } });
    if (!volunteer) {
      throw new NotFoundException('Volunteer not found');
    }

    const normalized = status.toLowerCase();
    if (!Object.values(VolunteerVerificationStatus).includes(normalized as VolunteerVerificationStatus)) {
      throw new BadRequestException('Unsupported volunteer verification status');
    }

    volunteer.verification_status = normalized as VolunteerVerificationStatus;
    return this.volunteerRepo.save(volunteer);
  }

  async listReliefOrgs(query: ReliefOrgQuery) {
    const { page, limit, skip } = this.getPagination(query);
    const where = query.status !== undefined ? { admin_verified: query.status === 'true' || query.status === 'approved' || query.status === 'verified' } : undefined;

    const [items, total] = await this.reliefOrgRepo.findAndCount({
      where,
      relations: { user: true },
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return this.buildPaginationResult(items, total, page, limit);
  }

  async verifyReliefOrg(id: string, status: string | boolean) {
    const org = await this.reliefOrgRepo.findOne({ where: { id } });
    if (!org) {
      throw new NotFoundException('Relief organization not found');
    }

    const isVerified = typeof status === 'boolean' ? status : status === 'true' || status === 'approved' || status === 'verified';

    org.admin_verified = isVerified;
    return this.reliefOrgRepo.save(org);
  }

  async listDisasters(query: DisasterQuery) {
    const { page, limit, skip } = this.getPagination(query);
    const verified = query.verified === undefined ? undefined : query.verified === 'true';
    const where = verified === undefined ? undefined : { is_verified: verified };

    const [items, total] = await this.disasterRepo.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return this.buildPaginationResult(items, total, page, limit);
  }

  async createDisaster(dto: { disaster_name: string; disaster_type: string; impacted_location: string; impact_time?: string; severity_level?: string; is_verified?: boolean }) {
    const disaster = this.disasterRepo.create({
      disaster_name: dto.disaster_name,
      disaster_type: dto.disaster_type as any,
      impacted_location: dto.impacted_location,
      impact_time: dto.impact_time ? new Date(dto.impact_time) : new Date(),
      severity_level: dto.severity_level || 'MEDIUM',
      is_verified: dto.is_verified ?? true,
    });
    return this.disasterRepo.save(disaster);
  }

  async verifyDisaster(id: string, verified: boolean) {
    const disaster = await this.disasterRepo.findOne({ where: { id } });
    if (!disaster) {
      throw new NotFoundException('Disaster not found');
    }

    disaster.is_verified = verified;
    return this.disasterRepo.save(disaster);
  }

  async listRescueRequests(query: RescueRequestQuery) {
    const { page, limit, skip } = this.getPagination(query);
    const normalizedStatus = query.status ? query.status.toUpperCase() : undefined;
    const where = normalizedStatus ? { status: normalizedStatus as RescueStatus } : undefined;

    const [items, total] = await this.rescueRequestRepo.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return this.buildPaginationResult(items, total, page, limit);
  }

  async createRescueRequest(dto: { requester_name?: string; contact_phone?: string; location: string; urgency_level?: string; details?: string }) {
    const request = this.rescueRequestRepo.create({
      requester_name: dto.requester_name || 'Anonymous',
      contact_phone: dto.contact_phone || '+8801700000000',
      location: dto.location,
      urgency_level: (dto.urgency_level?.toUpperCase() as UrgencyLevel) || UrgencyLevel.HIGH,
      status: RescueStatus.PENDING,
      details: dto.details || '',
    });
    return this.rescueRequestRepo.save(request);
  }

  async listCommunityPosts(query: CommunityPostQuery) {
    const { page, limit, skip } = this.getPagination(query);
    const where = query.status ? { status: query.status as PostStatus } : undefined;

    const [items, total] = await this.communityPostRepo.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip,
      take: limit,
      withDeleted: query.includeDeleted,
    });

    return this.buildPaginationResult(items, total, page, limit);
  }

  async moderateCommunityPost(id: string, status: string) {
    const post = await this.communityPostRepo.findOne({ where: { id }, withDeleted: true });
    if (!post) {
      throw new NotFoundException('Community post not found');
    }

    const normalized = status.toLowerCase();
    if (!Object.values(PostStatus).includes(normalized as PostStatus)) {
      throw new BadRequestException('Unsupported post status');
    }

    post.status = normalized as PostStatus;
    return this.communityPostRepo.save(post);
  }

  async softDeleteCommunityPost(id: string) {
    const post = await this.communityPostRepo.findOne({ where: { id }, withDeleted: true });
    if (!post) {
      throw new NotFoundException('Community post not found');
    }

    post.status = PostStatus.REMOVED;
    await this.communityPostRepo.save(post);
    await this.communityPostRepo.softDelete(id);

    return { message: 'Community post soft deleted successfully' };
  }

  async restoreCommunityPost(id: string) {
    const post = await this.communityPostRepo.findOne({ where: { id }, withDeleted: true });
    if (!post) {
      throw new NotFoundException('Community post not found');
    }

    await this.communityPostRepo.restore(id);
    await this.communityPostRepo.update(id, { status: PostStatus.POSTED });

    return { message: 'Community post restored successfully' };
  }

  async generateReport() {
    const [accounts, volunteers, reliefOrgs, disasters, rescueRequests, posts] = await Promise.all([
      this.authRepo.count(),
      this.volunteerRepo.count(),
      this.reliefOrgRepo.count(),
      this.disasterRepo.count(),
      this.rescueRequestRepo.count(),
      this.communityPostRepo.count(),
    ]);

    return {
      accounts,
      volunteers,
      reliefOrgs,
      disasters,
      rescueRequests,
      posts,
      generatedAt: new Date(),
    };
  }

  async listTables() {
    const entities = this.dataSource.entityMetadatas;
    const tables = await Promise.all(
      entities.map(async (meta) => {
        const repo = this.dataSource.getRepository(meta.target);
        const count = await repo.count();
        return {
          tableName: meta.tableName,
          name: meta.name,
          count,
        };
      })
    );
    return tables;
  }

  async getTableData(tableName: string, query: ListQuery) {
    const meta = this.dataSource.entityMetadatas.find(
      (m) => m.tableName === tableName || m.name.toLowerCase() === tableName.toLowerCase()
    );
    if (!meta) {
      throw new NotFoundException(`Table metadata for ${tableName} not found`);
    }

    const { page, limit, skip } = this.getPagination(query);
    const repo = this.dataSource.getRepository(meta.target);
    const [items, total] = await repo.findAndCount({
      skip,
      take: limit,
    });

    return this.buildPaginationResult(items, total, page, limit);
  }
}
