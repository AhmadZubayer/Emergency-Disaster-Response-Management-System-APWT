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
import { CustomLoggerService } from 'src/common/logger/logger.service';
import { AuditService } from 'src/common/audit/audit.service';

@Injectable()
export class AuthService {
  private readonly logger = new CustomLoggerService(AuthService.name);

  constructor(
    @InjectRepository(Auth) private readonly authRepo: Repository<Auth>,
    private readonly usersService: UsersService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly auditService: AuditService,
  ) {}

  async registerUser(registerUserDto: RegisterUserDto) {
    const existingAuth = await this.authRepo.findOne({
      where: { email: registerUserDto.email },
    });

    if (existingAuth) {
      this.logger.logWarning(`Registration failed: email ${registerUserDto.email} already exists`);
      throw new BadRequestException('Email already exists');
    }

    const hashPass = await bcrypt.hash(registerUserDto.password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  
    const createdUser = await this.usersService.createUser(registerUserDto);

   
    const authRecord = this.authRepo.create({
      user_id: createdUser.id,
      email: registerUserDto.email,
      password: hashPass,
      role: USER_ROLE.USER,
      email_verified: false,
      email_verification_token: verificationToken,
      email_verification_expires: verificationExpires,
    });

    this.auditService.setCreated(authRecord, createdUser.id);
    await this.authRepo.save(authRecord);

    this.logger.logBusinessEvent('User registered', 'AuthService', {
      userId: createdUser.id,
      email: authRecord.email,
    });

    try {
      await this.mailerService.sendVerificationEmail(
        authRecord.email,
        createdUser.name,
        verificationToken,
      );
    } catch (error: any) {
      this.logger.logError('Failed to send verification email', error?.stack);
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
      this.logger.logWarning('Email verification failed: invalid token');
      throw new BadRequestException('Invalid or expired verification token');
    }

    if (
      authRecord.email_verification_expires &&
      new Date() > new Date(authRecord.email_verification_expires)
    ) {
      this.logger.logWarning(`Email verification failed: token expired for email ${authRecord.email}`);
      throw new BadRequestException(
        'Verification token has expired. Please request a new verification email.',
      );
    }

    authRecord.email_verified = true;
    authRecord.email_verification_token = null;
    authRecord.email_verification_expires = null;
    this.auditService.setUpdated(authRecord, authRecord.user_id);
    await this.authRepo.save(authRecord);

    this.logger.logBusinessEvent('User email verified', 'AuthService', {
      userId: authRecord.user_id,
    });

    return {
      message: 'Email successfully verified!',
    };
  }

  async signin(signInUserDto: signInUserDto) {
    const authRecord = await this.authRepo.findOne({
      where: { email: signInUserDto.email },
    });

    if (!authRecord) {
      this.logger.logWarning(`Sign in failed: user email ${signInUserDto.email} not found`);
      throw new BadRequestException('user not Found');
    }

    const isPassMatch = await bcrypt.compare(
      signInUserDto.password,
      authRecord.password,
    );

    if (!isPassMatch) {
      this.logger.logWarning(`Sign in failed: invalid credentials for email ${signInUserDto.email}`);
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
    this.auditService.setUpdated(authRecord, authRecord.user_id);
    await this.authRepo.save(authRecord);

    this.logger.logBusinessEvent('User logged in', 'AuthService', {
      userId: authRecord.user_id,
    });

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
    this.auditService.setUpdated(authRecord, authRecord.user_id);
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
      this.auditService.setUpdated(authRecord, userId);
      await this.authRepo.save(authRecord);
    }

    this.logger.logBusinessEvent('User logged out', 'AuthService', { userId });

    return {
      message: 'Logged out successfully',
    };
  }
}
