import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;

    const email = emails?.[0]?.value;
    const firstName = name?.givenName;
    const lastName = name?.familyName;
    const picture = photos?.[0]?.value;

    if (!email) {
      return done(new Error('No email found in Google profile'), false);
    }

    const user = {
      email,
      firstName: firstName || ' ',
      lastName: lastName || ' ',
      picture: picture || '',
    };

    const validatedUser = await this.authService.validateOAuthLogin(
      user.email,
      'google',
      user.firstName,
      user.lastName,
    );
    done(null, validatedUser);
  }
}
