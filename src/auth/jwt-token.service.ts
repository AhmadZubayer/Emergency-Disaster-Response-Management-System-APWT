import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './types/jwt-payload.type';
import type { StringValue } from 'ms';

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateAccessToken(payload: JwtPayload) {
    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('ACCESS_JWT_SECRET'),
      expiresIn: this.configService.getOrThrow<string>('ACCESS_JWT_EXPIRES') as StringValue,
    });
  }

  generateRefreshToken(payload: JwtPayload) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_JWT_SECRET'),
      expiresIn: this.configService.get<string>('REFRESH_JWT_EXPIRES') as StringValue,
    });
  }
}