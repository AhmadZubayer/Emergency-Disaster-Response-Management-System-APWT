import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RescueRequest, RescueStatus } from './entities/rescue-request.entity';
import { CreateRescueRequestDto } from './dto/create-rescue-request.dto';
import { UpdateRescueRequestStatusDto } from './dto/update-rescue-request-status.dto';
import { FilesService } from 'src/files/files.service';
import { CustomLoggerService } from 'src/common/logger/logger.service';
import { AuditService } from 'src/common/audit/audit.service';

@Injectable()
export class RescueRequestsService {
  private readonly logger = new CustomLoggerService(RescueRequestsService.name);

  constructor(
    @InjectRepository(RescueRequest)
    private readonly rescueRepository: Repository<RescueRequest>,
    private readonly filesService: FilesService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    userId: string,
    dto: CreateRescueRequestDto,
    file?: Express.Multer.File,
  ): Promise<RescueRequest> {
    let photoUrl = dto.photo_url || null;

    if (file) {
      const uploadedUrls = await this.filesService.saveFiles([file], {
        subFolder: '/rescue-photos',
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      });
      if (uploadedUrls.length > 0) {
        photoUrl = uploadedUrls[0];
      }
    }

    const rescueRequest = this.rescueRepository.create({
      ...dto,
      user_id: userId,
      photo_url: photoUrl,
      status: RescueStatus.PENDING,
    });

    this.auditService.setCreated(rescueRequest, userId);
    const savedRequest = await this.rescueRepository.save(rescueRequest);

    this.logger.logBusinessEvent('Rescue request created', 'RescueRequestsService', {
      requestId: savedRequest.id,
      userId,
      urgency: savedRequest.urgency_level,
    });

    return savedRequest;
  }

  async findMyRequests(userId: string): Promise<RescueRequest[]> {
    return await this.rescueRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<RescueRequest> {
    const request = await this.rescueRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!request) {
      throw new NotFoundException(`Rescue request with ID "${id}" not found`);
    }
    return request;
  }

  async findAll(): Promise<RescueRequest[]> {
    return await this.rescueRepository.find({
      relations: { user: true },
      order: { created_at: 'DESC' },
    });
  }

  async updateStatus(
    id: string,
    dto: UpdateRescueRequestStatusDto,
    updaterId?: string,
  ): Promise<RescueRequest> {
    const request = await this.findOne(id);
    request.status = dto.status;
    if (dto.assigned_rescuer_id !== undefined) {
      request.assigned_rescuer_id = dto.assigned_rescuer_id;
    }
    this.auditService.setUpdated(request, updaterId);
    return await this.rescueRepository.save(request);
  }

  async cancelMyRequest(id: string, userId: string): Promise<RescueRequest> {
    const request = await this.findOne(id);
    if (request.user_id !== userId) {
      throw new BadRequestException(
        'You can only cancel your own rescue requests',
      );
    }
    if (request.status === RescueStatus.RESCUED) {
      throw new BadRequestException(
        'Cannot cancel a rescue request that is already completed',
      );
    }
    request.status = RescueStatus.CANCELLED;
    this.auditService.setUpdated(request, userId);
    return await this.rescueRepository.save(request);
  }
}
