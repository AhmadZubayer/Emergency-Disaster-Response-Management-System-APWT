import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtGuard } from './guards/access-jwt-guard';
import { JwtStrategy } from './strategy/access-jwt-strategy';
import { RefreshJwtGuard } from './guards/refresh-jwt-guard';
import { RefreshJwtStrategy } from './strategy/refresh-jwt-strategy';
import type { StringValue } from 'ms';
import { RolesGuard } from './guards/roles.guard';
import { JwtTokenService } from './jwt-token.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('ACCESS_JWT_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow<string>('ACCESS_JWT_EXPIRES') as StringValue,
        },
      }),
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtTokenService,
    JwtGuard,
    JwtStrategy,
    RefreshJwtGuard,
    RefreshJwtStrategy,
    RolesGuard,
  ],
  exports: [
    AuthService,
    JwtTokenService,
    JwtGuard,
    RefreshJwtGuard,
    RolesGuard,
    PassportModule,
  ],
})
export class AuthModule {}