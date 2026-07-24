import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import { signInUserDto } from './dto/sign-in-user.dto';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './types/jwt-payload.type';
import { JwtTokenService } from './jwt-token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly configService: ConfigService,
  ) {}

  async registerUser(registerUserDto: RegisterUserDto) {
    const existingUser = await this.usersService.getUserByEmail(
      registerUserDto.email,
    );

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }
    const hashPass = await bcrypt.hash(registerUserDto.password, 10);
    registerUserDto.password = hashPass;
    return await this.usersService.createUser(registerUserDto);
  }

  async signin(signInUserDto: signInUserDto) {
    const user = await this.usersService.getUserByEmail(signInUserDto.email);
    if (user == null) {
      throw new BadRequestException('user not Found');
    }

    const isPassMatch = await bcrypt.compare(
      signInUserDto.password,
      user.password,
    );

    if (!isPassMatch) {
      throw new BadRequestException('password not matched');
    }

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtTokenService.generateAccessToken(payload);
    const refreshToken = this.jwtTokenService.generateRefreshToken(payload);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(userId: string) {
    const user = await this.usersService.getUserById(userId);

    if (!user || !user.refresh_token) {
      throw new UnauthorizedException();
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtTokenService.generateAccessToken(payload);
    const refreshToken = this.jwtTokenService.generateRefreshToken(payload);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);

    return {
      message: 'Logged out successfully',
    };
  }
}
