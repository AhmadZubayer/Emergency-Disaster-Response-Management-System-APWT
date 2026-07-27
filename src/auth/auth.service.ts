import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { signInUserDto } from './dto/sign-in-user.dto';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './types/jwt-payload.type';
import { JwtTokenService } from './jwt-token.service';
import { MailerService } from 'src/mailer/mailer.service';
import { Auth } from './entities/auth.entity';
import { USER_ROLE } from './types/user-roles.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth) private readonly authRepo: Repository<Auth>,
    private readonly usersService: UsersService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  async registerUser(registerUserDto: RegisterUserDto) {
    const existingAuth = await this.authRepo.findOne({
      where: { email: registerUserDto.email },
    });

    if (existingAuth) {
      throw new BadRequestException('Email already exists');
    }

    const hashPass = await bcrypt.hash(registerUserDto.password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // 1. Create user profile in 'users' table
    const createdUser = await this.usersService.createUser(registerUserDto);

    // 2. Create credentials record in 'auth' table
    const authRecord = this.authRepo.create({
      user_id: createdUser.id,
      email: registerUserDto.email,
      password: hashPass,
      role: USER_ROLE.USER,
      email_verified: false,
      email_verification_token: verificationToken,
      email_verification_expires: verificationExpires,
    });

    await this.authRepo.save(authRecord);

    try {
      await this.mailerService.sendVerificationEmail(
        authRecord.email,
        createdUser.name,
        verificationToken,
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }

    return {
      message:
        'Registration successful. Please check your email to verify your account.',
      userId: createdUser.id,
      email: authRecord.email,
    };
  }

  async verifyEmail(token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }

    const authRecord = await this.authRepo.findOne({
      where: { email_verification_token: token },
    });

    if (!authRecord) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    if (
      authRecord.email_verification_expires &&
      new Date() > new Date(authRecord.email_verification_expires)
    ) {
      throw new BadRequestException(
        'Verification token has expired. Please request a new verification email.',
      );
    }

    authRecord.email_verified = true;
    authRecord.email_verification_token = null;
    authRecord.email_verification_expires = null;
    await this.authRepo.save(authRecord);

    return {
      message: 'Email successfully verified!',
    };
  }

  async signin(signInUserDto: signInUserDto) {
    const authRecord = await this.authRepo.findOne({
      where: { email: signInUserDto.email },
    });

    if (!authRecord) {
      throw new BadRequestException('user not Found');
    }

    const isPassMatch = await bcrypt.compare(
      signInUserDto.password,
      authRecord.password,
    );

    if (!isPassMatch) {
      throw new BadRequestException('password not matched');
    }

    const payload: JwtPayload = {
      id: authRecord.user_id,
      email: authRecord.email,
      role: authRecord.role,
    };

    const accessToken = this.jwtTokenService.generateAccessToken(payload);
    const refreshToken = this.jwtTokenService.generateRefreshToken(payload);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    authRecord.refresh_token = hashedRefreshToken;
    await this.authRepo.save(authRecord);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(userId: string) {
    const authRecord = await this.authRepo.findOne({
      where: { user_id: userId },
    });

    if (!authRecord || !authRecord.refresh_token) {
      throw new UnauthorizedException();
    }

    const payload: JwtPayload = {
      id: authRecord.user_id,
      email: authRecord.email,
      role: authRecord.role,
    };

    const accessToken = this.jwtTokenService.generateAccessToken(payload);
    const refreshToken = this.jwtTokenService.generateRefreshToken(payload);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    authRecord.refresh_token = hashedRefreshToken;
    await this.authRepo.save(authRecord);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async logout(userId: string) {
    const authRecord = await this.authRepo.findOne({
      where: { user_id: userId },
    });

    if (authRecord) {
      authRecord.refresh_token = null;
      await this.authRepo.save(authRecord);
    }

    return {
      message: 'Logged out successfully',
    };
  }
}
