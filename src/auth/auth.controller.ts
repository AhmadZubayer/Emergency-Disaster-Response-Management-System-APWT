import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtGuard } from './guards/access-jwt-guard';
import { signInUserDto } from './dto/sign-in-user.dto';
import { RolesGuard } from './guards/roles.guard';
import { RefreshJwtDto } from './dto/refresh-jwt.dto';
import { RefreshJwtGuard } from './guards/refresh-jwt-guard';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  // @UseGuards(JwtGuard, RolesGuard)

  @Post('register-user')
  registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto);
  }

  @Post('sign-in')
  login(@Body() loginDto: signInUserDto) {
    return this.authService.signin(loginDto);
  }

  @Post('refresh-token')
  @UseGuards(RefreshJwtGuard)
  refreshToken(@Req() req) {
    return this.authService.refreshToken(req.user.id);
  }
}
