import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/users.entity';
import { Repository } from 'typeorm';
import { RegisterUserDto } from 'src/auth/dto/register-user.dto';

import { USER_ROLE } from 'src/auth/types/user-roles.type';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private readonly usersRepo: Repository<Users>,
  ) {}

  async createUser(createUsersDto: RegisterUserDto): Promise<Users> {
    const user = this.usersRepo.create({
      name: createUsersDto.name,
      email: createUsersDto.email,
      phone: createUsersDto.phoneNumber,
      password: createUsersDto.password,
      location: createUsersDto.location,
      role: USER_ROLE.USER,
    });

    return await this.usersRepo.save(user);
  }

  async getAllUsers(): Promise<Users[]> {
    return await this.usersRepo.find({
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  async getUserByEmail(email: string): Promise<Users | null> {
    return await this.usersRepo.findOne({
      where: {
        email: email,
      },
    });
  }

  async getUserById(id: string): Promise<Users | null> {
    return await this.usersRepo.findOne({
      where: {
        id: id,
      },
    });
  }

  async updateUser(id: string, updateUsersDto: any): Promise<Users> {
    const user = await this.usersRepo.findOne({
      where: { id: id },
    });

    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    Object.assign(user, updateUsersDto);
    console.log(user);
    return await this.usersRepo.save(user);
  }

  async deleteUser(id: string): Promise<string> {
    const result = await this.usersRepo.delete(id);
    if (result.affected == 0) {
      throw new NotFoundException('User Not Found. meow');
    }

    return `User Deleted Successfully. id: ${id} `;
  }

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<Users> {
    const user = await this.getUserById(id);

    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    user.refresh_token = refreshToken;

    return await this.usersRepo.save(user);
  }
}
