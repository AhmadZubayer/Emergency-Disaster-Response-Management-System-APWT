import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';

import { RegisterUserDto } from './dto/register-user.dto';
import { signInUserDto } from './dto/sign-in-user.dto';
import { RefreshJwtGuard } from './guards/refresh-jwt-guard';
import { JwtGuard } from './guards/access-jwt-guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register-user')
  @ResponseMessage('User registered successfully. Please check your email for verification.')
  registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto);
  }

  @Get('verify-email')
  @ResponseMessage('Email verified successfully')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('sign-in')
  @ResponseMessage('User signed in successfully')
  async login(
    @Body() loginDto: signInUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.signin(loginDto);
    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return tokens;
  }

  @Post('refresh-token')
  @UseGuards(RefreshJwtGuard)
  @ResponseMessage('Token refreshed successfully')
  async refreshToken(@Req() req, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.refreshToken(req.user.id);
    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return tokens;
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  @ResponseMessage('User logged out successfully')
  async logout(
    @CurrentUser('id') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return this.authService.logout(userId);
  }

  @Get('me')
  @UseGuards(JwtGuard)
  @ResponseMessage('User retrieved successfully')
  getMe(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }
}

