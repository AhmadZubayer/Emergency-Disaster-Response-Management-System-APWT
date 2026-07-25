import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JwtPayload } from '../types/jwt-payload.type';
import { Auth } from '../entities/auth.entity';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Auth) private readonly authRepo: Repository<Auth>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('REFRESH_JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const refreshToken = authHeader.replace('Bearer ', '');

    const authRecord = await this.authRepo.findOne({
      where: { user_id: payload.id },
    });

    if (!authRecord || !authRecord.refresh_token) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      authRecord.refresh_token,
    );

    if (!isRefreshTokenMatching) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return {
      id: authRecord.user_id,
      email: authRecord.email,
      role: authRecord.role,
    };
  }
}
