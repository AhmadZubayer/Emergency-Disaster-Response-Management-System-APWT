import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/users.entity';
import { Repository } from 'typeorm';
import { RegisterUserDto } from 'src/auth/dto/register-user.dto';

import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { CompleteUserProfileDto } from './dto/complete-user-profile.dto';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private readonly usersRepo: Repository<Users>,
    private readonly filesService: FilesService,
  ) {}

  async createUser(createUsersDto: RegisterUserDto): Promise<Users> {
    const existingPhone = await this.usersRepo.findOne({
      where: { phone: createUsersDto.phoneNumber },
    });

    if (existingPhone) {
      throw new BadRequestException('Phone number is already registered');
    }

    const user = this.usersRepo.create({
      name: createUsersDto.name,
      phone: createUsersDto.phoneNumber,
      location: createUsersDto.location,
      address: createUsersDto.address,
    });

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
      throw new NotFoundException('User Not Found');
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
    return await this.usersRepo.save(user);
  }

  async completeProfile(
    id: string,
    completeUserProfileDto: CompleteUserProfileDto,
    file?: Express.Multer.File,
  ): Promise<Users> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User Not Found');
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
    return await this.usersRepo.save(user);
  }

  async toggleIsSafe(id: string): Promise<Users> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    user.is_safe = !user.is_safe;
    return await this.usersRepo.save(user);
  }
}
