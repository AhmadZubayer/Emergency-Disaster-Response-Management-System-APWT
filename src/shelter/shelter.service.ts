import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shelter } from './entities/shelter.entity';
import { CreateShelterDto } from './dto/create-shelter.dto';
import { UpdateShelterDto } from './dto/update-shelter.dto';
import { ReliefOrg } from 'src/relief-org/entities/relief-org.entity';
import { Disaster } from 'src/disaster/entities/disaster.entity';
import { USER_ROLE } from 'src/auth/types/user-roles.type';
import { CustomLoggerService } from 'src/common/logger/logger.service';
import { AuditService, AuditTask } from 'src/common/audit/audit.service';
import { EntityNotFoundException } from 'src/common/exceptions/entity-not-found.exception';

@Injectable()
export class ShelterService {
  private readonly logger = new CustomLoggerService(ShelterService.name);

  constructor(
    @InjectRepository(Shelter)
    private readonly shelterRepo: Repository<Shelter>,
    @InjectRepository(ReliefOrg)
    private readonly reliefOrgRepo: Repository<ReliefOrg>,
    @InjectRepository(Disaster)
    private readonly disasterRepo: Repository<Disaster>,
    private readonly auditService: AuditService,
  ) {}

  async createShelter(
    userId: string,
    userRole: string,
    dto: CreateShelterDto,
  ): Promise<Shelter> {
    const disaster = await this.disasterRepo.findOne({
      where: { id: dto.disaster_id },
    });
    if (!disaster) {
      throw new EntityNotFoundException('Disaster', dto.disaster_id);
    }

    const reliefOrg = await this.reliefOrgRepo.findOne({
      where: { user_id: userId },
    });

    if (!reliefOrg && userRole !== USER_ROLE.ADMIN) {
      throw new ForbiddenException(
        'You must have a registered Relief Organization account to create shelters',
      );
    }

    if (reliefOrg && !reliefOrg.admin_verified && userRole !== USER_ROLE.ADMIN) {
      throw new ForbiddenException(
        'Your Relief Organization account is pending admin verification',
      );
    }

    const targetOrgId = reliefOrg ? reliefOrg.id : undefined;

    if (!targetOrgId && userRole === USER_ROLE.ADMIN) {
      throw new BadRequestException(
        'As Admin, please ensure you are operating on a valid relief organization context',
      );
    }

    const shelter = this.shelterRepo.create({
      shelter_name: dto.shelter_name,
      shelter_location: dto.shelter_location,
      shelter_capacity: dto.shelter_capacity,
      current_people_count: dto.current_people_count || 0,
      disaster_id: dto.disaster_id,
      relief_org_id: targetOrgId,
    });

    this.auditService.setCreated(shelter, userId);
    this.logger.log(`Created shelter: ${shelter.shelter_name}`);
    const savedShelter = await this.shelterRepo.save(shelter);
    await this.auditService.logAudit(
      AuditTask.CREATE,
      userId,
      `Created shelter ID: ${savedShelter.id} (${savedShelter.shelter_name})`,
    );
    return savedShelter;
  }

  async getShelters(disasterId?: string): Promise<Shelter[]> {
    const query = this.shelterRepo
      .createQueryBuilder('shelter')
      .leftJoinAndSelect('shelter.relief_org', 'relief_org')
      .leftJoinAndSelect('shelter.disaster', 'disaster');

    if (disasterId) {
      query.where('shelter.disaster_id = :disasterId', { disasterId });
    }

    return query.orderBy('shelter.created_at', 'DESC').getMany();
  }

  async getShelterById(id: string): Promise<Shelter> {
    const shelter = await this.shelterRepo.findOne({
      where: { id },
      relations: { relief_org: true, disaster: true },
    });

    if (!shelter) {
      throw new EntityNotFoundException('Shelter', id);
    }

    return shelter;
  }

  async updateShelter(
    id: string,
    userId: string,
    userRole: string,
    dto: UpdateShelterDto,
  ): Promise<Shelter> {
    const shelter = await this.shelterRepo.findOne({
      where: { id },
    });

    if (!shelter) {
      throw new EntityNotFoundException('Shelter', id);
    }

    await this.checkShelterOwnership(shelter, userId, userRole);

    if (dto.disaster_id) {
      const disaster = await this.disasterRepo.findOne({
        where: { id: dto.disaster_id },
      });
      if (!disaster) {
        throw new EntityNotFoundException('Disaster', dto.disaster_id);
      }
      shelter.disaster_id = dto.disaster_id;
    }

    if (dto.shelter_name !== undefined) shelter.shelter_name = dto.shelter_name;
    if (dto.shelter_location !== undefined) shelter.shelter_location = dto.shelter_location;
    if (dto.shelter_capacity !== undefined) shelter.shelter_capacity = dto.shelter_capacity;
    if (dto.current_people_count !== undefined) shelter.current_people_count = dto.current_people_count;

    this.auditService.setUpdated(shelter, userId);
    this.logger.log(`Updated shelter ID: ${id}`);
    const updatedShelter = await this.shelterRepo.save(shelter);
    await this.auditService.logAudit(
      AuditTask.UPDATE,
      userId,
      `Updated shelter ID: ${id} (${shelter.shelter_name})`,
    );
    return updatedShelter;
  }

  async deleteShelter(
    id: string,
    userId: string,
    userRole: string,
  ): Promise<{ message: string }> {
    const shelter = await this.shelterRepo.findOne({
      where: { id },
    });

    if (!shelter) {
      throw new EntityNotFoundException('Shelter', id);
    }

    await this.checkShelterOwnership(shelter, userId, userRole);

    this.auditService.setDeleted(shelter, userId);
    await this.shelterRepo.remove(shelter);
    await this.auditService.logAudit(
      AuditTask.DELETE,
      userId,
      `Deleted shelter ID: ${id} (${shelter.shelter_name})`,
    );
    this.logger.log(`Deleted shelter ID: ${id}`);
    return { message: 'Shelter deleted successfully' };
  }

  private async checkShelterOwnership(
    shelter: Shelter,
    userId: string,
    userRole: string,
  ): Promise<void> {
    if (userRole === USER_ROLE.ADMIN) {
      return;
    }

    const reliefOrg = await this.reliefOrgRepo.findOne({
      where: { user_id: userId },
    });

    if (!reliefOrg || shelter.relief_org_id !== reliefOrg.id) {
      throw new ForbiddenException(
        'Forbidden. You are only allowed to modify shelters managed by your own Relief Organization.',
      );
    }
  }
}
