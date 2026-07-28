import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
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
  login(@Body() loginDto: signInUserDto) {
    return this.authService.signin(loginDto);
  }

  @Post('refresh-token')
  @UseGuards(RefreshJwtGuard)
  @ResponseMessage('Token refreshed successfully')
  refreshToken(@Req() req) {
    return this.authService.refreshToken(req.user.id);
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  @ResponseMessage('User logged out successfully')
  logout(@CurrentUser('id') userId: string) {
    return this.authService.logout(userId);
  }
}
