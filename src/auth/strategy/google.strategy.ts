import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID:
        configService.get<string>('GOOGLE_CLIENT_ID') ||
        'dummy-client-id.apps.googleusercontent.com',
      clientSecret:
        configService.get<string>('GOOGLE_CLIENT_SECRET') || 'dummy-client-secret',
      callbackURL:
        configService.get<string>('GOOGLE_CALLBACK_URL') ||
        'http://localhost:3000/api/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const userProfile = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      fullName: `${name.givenName || ''} ${name.familyName || ''}`.trim() || emails[0].value.split('@')[0],
      picture: photos && photos[0] ? photos[0].value : null,
      accessToken,
    };

    const user = await this.authService.validateGoogleUser(userProfile);
    done(null, user);
  }
}
