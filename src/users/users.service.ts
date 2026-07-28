import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/users.entity';
import { Repository } from 'typeorm';
import { RegisterUserDto } from 'src/auth/dto/register-user.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { CompleteUserProfileDto } from './dto/complete-user-profile.dto';
import { FilesService } from 'src/files/files.service';
import { CustomLoggerService } from 'src/common/logger/logger.service';
import { AuditService } from 'src/common/audit/audit.service';
import { EntityNotFoundException } from 'src/common/exceptions/entity-not-found.exception';
import { ResourceConflictException } from 'src/common/exceptions/resource-conflict.exception';

@Injectable()
export class UsersService {
  private readonly logger = new CustomLoggerService(UsersService.name);

  constructor(
    @InjectRepository(Users) private readonly usersRepo: Repository<Users>,
    private readonly filesService: FilesService,
    private readonly auditService: AuditService,
  ) {}

  async createUser(createUsersDto: RegisterUserDto): Promise<Users> {
    const existingPhone = await this.usersRepo.findOne({
      where: { phone: createUsersDto.phoneNumber },
    });

    if (existingPhone) {
      this.logger.warn(`Phone number conflict: ${createUsersDto.phoneNumber}`);
      throw new ResourceConflictException('Phone number is already registered');
    }

    const user = this.usersRepo.create({
      name: createUsersDto.name,
      phone: createUsersDto.phoneNumber,
      address: createUsersDto.address,
    });

    this.auditService.setCreated(user);
    this.logger.log(`Created new user with phone: ${user.phone}`);
    return await this.usersRepo.save(user);
  }

  async getAllUsers(): Promise<Users[]> {
    return await this.usersRepo.find({
      select: {
        id: true,
        name: true,
        phone: true,
      },
    });
  }

  async getUserById(id: string): Promise<Users | null> {
    return await this.usersRepo.findOne({
      where: {
        id: id,
      },
      relations: {
        auth: true,
      },
    });
  }

  async updateProfile(
    id: string,
    updateUserProfileDto: UpdateUserProfileDto,
    file?: Express.Multer.File,
  ): Promise<Users> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new EntityNotFoundException('User', id);
    }

    if (file) {
      if (user.photo_url) {
        await this.filesService.deleteFile(user.photo_url);
      }
      const customFileName = `${id}_profile_${Date.now()}`;
      const urls = await this.filesService.saveFiles([file], {
        subFolder: '/user-profile-pictures',
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png'],
        customFileName: customFileName,
      });
      user.photo_url = urls[0];
    }

    Object.assign(user, updateUserProfileDto);
    this.auditService.setUpdated(user, id);
    this.logger.log(`Updated user profile for ID: ${id}`);
    return await this.usersRepo.save(user);
  }

  async completeProfile(
    id: string,
    completeUserProfileDto: CompleteUserProfileDto,
    file?: Express.Multer.File,
  ): Promise<Users> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new EntityNotFoundException('User', id);
    }

    if (file) {
      if (user.photo_url) {
        await this.filesService.deleteFile(user.photo_url);
      }
      const customFileName = `${id}_profile_${Date.now()}`;
      const urls = await this.filesService.saveFiles([file], {
        subFolder: '/user-profile-pictures',
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png'],
        customFileName: customFileName,
      });
      user.photo_url = urls[0];
    }

    Object.assign(user, completeUserProfileDto);
    this.auditService.setUpdated(user, id);
    this.logger.log(`Completed user profile for ID: ${id}`);
    return await this.usersRepo.save(user);
  }

  async toggleIsSafe(id: string): Promise<Users> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new EntityNotFoundException('User', id);
    }

    user.is_safe = !user.is_safe;
    this.auditService.setUpdated(user, id);
    this.logger.log(`Toggled is_safe status to ${user.is_safe} for user ID: ${id}`);
    return await this.usersRepo.save(user);
  }
}
