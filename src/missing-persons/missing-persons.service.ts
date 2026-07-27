import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import {
  MissingPerson,
  MissingPersonStatus,
} from './entities/missing-person.entity';
import { CreateMissingPersonDto } from './dto/create-missing-person.dto';
import { UpdateMissingPersonDto } from './dto/update-missing-person.dto';
import { UpdateMissingPersonStatusDto } from './dto/update-missing-person-status.dto';
import { FilesService } from 'src/files/files.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class MissingPersonsService {
  constructor(
    @InjectRepository(MissingPerson)
    private readonly missingPersonRepository: Repository<MissingPerson>,
    private readonly filesService: FilesService,
    private readonly usersService: UsersService,
  ) {}

  async create(
    reporterId: string,
    dto: CreateMissingPersonDto,
    file?: Express.Multer.File,
  ): Promise<MissingPerson> {
    let contactPhone = dto.contact_phone?.trim();

    if (!contactPhone) {
      const user = await this.usersService.getUserById(reporterId);
      if (user && user.phone) {
        contactPhone = user.phone;
      } else {
        throw new BadRequestException(
          'Contact phone is required and could not be fetched from user profile',
        );
      }
    }

    let photoUrl = dto.photo_url || null;

    if (file) {
      const uploadedUrls = await this.filesService.saveFiles([file], {
        subFolder: '/missing-person-photos',
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

    const missingPerson = this.missingPersonRepository.create({
      ...dto,
      reporter_id: reporterId,
      contact_phone: contactPhone,
      photo_url: photoUrl,
      status: MissingPersonStatus.MISSING,
    });

    return await this.missingPersonRepository.save(missingPerson);
  }

  async findAll(
    status?: MissingPersonStatus,
    search?: string,
  ): Promise<MissingPerson[]> {
    const queryBuilder = this.missingPersonRepository.createQueryBuilder('mp');

    if (status) {
      queryBuilder.andWhere('mp.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(mp.full_name ILIKE :search OR mp.last_seen_location ILIKE :search OR mp.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy('mp.created_at', 'DESC');
    return await queryBuilder.getMany();
  }

  async findMyReports(reporterId: string): Promise<MissingPerson[]> {
    return await this.missingPersonRepository.find({
      where: { reporter_id: reporterId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<MissingPerson> {
    const report = await this.missingPersonRepository.findOne({
      where: { id },
    });
    if (!report) {
      throw new NotFoundException(
        `Missing person report with ID "${id}" not found`,
      );
    }
    return report;
  }

  async update(
    id: string,
    reporterId: string,
    role: string,
    dto: UpdateMissingPersonDto,
    file?: Express.Multer.File,
  ): Promise<MissingPerson> {
    const report = await this.findOne(id);
    this.checkPermission(report, reporterId, role);

    if (file) {
      if (report.photo_url) {
        await this.filesService.deleteFile(report.photo_url);
      }
      const uploadedUrls = await this.filesService.saveFiles([file], {
        subFolder: '/missing-person-photos',
        allowedMimeTypes: [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
        ],
      });
      if (uploadedUrls.length > 0) {
        report.photo_url = uploadedUrls[0];
      }
    }

    Object.assign(report, dto);
    return await this.missingPersonRepository.save(report);
  }

  async updateStatus(
    id: string,
    reporterId: string,
    role: string,
    dto: UpdateMissingPersonStatusDto,
  ): Promise<MissingPerson> {
    const report = await this.findOne(id);
    this.checkPermission(report, reporterId, role);

    report.status = dto.status;
    return await this.missingPersonRepository.save(report);
  }

  async remove(
    id: string,
    reporterId: string,
    role: string,
  ): Promise<{ message: string }> {
    const report = await this.findOne(id);
    this.checkPermission(report, reporterId, role);

    if (report.photo_url) {
      await this.filesService.deleteFile(report.photo_url);
    }

    await this.missingPersonRepository.remove(report);
    return { message: `Missing person report "${id}" has been deleted.` };
  }

  private checkPermission(
    report: MissingPerson,
    userId: string,
    role: string,
  ): void {
    if (report.reporter_id !== userId && role !== 'admin') {
      throw new ForbiddenException(
        'You do not have permission to modify this missing person report',
      );
    }
  }
}
