import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './user/entity/user.entity';
import { OAuth2Client } from 'google-auth-library';
import { UserRegisterDto } from './user/dto/user-register.dto';
import * as crypto from 'crypto';
// import { MoreThan } from 'typeorm';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {
    // IMPORTANT: Store client ID in environment variables
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(userDto: UserRegisterDto) {
    if (userDto.password !== userDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    const existingUser = await this.userService.findByEmail(userDto.email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }
    return this.userService.create(userDto);
  }

  async googleLogin(token: string): Promise<any> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException(
          'Google authentication failed: no payload',
        );
      }
      const { email, given_name, family_name } = payload;

      if (!email) {
        throw new UnauthorizedException(
          'Google authentication failed: no email',
        );
      }

      let user = await this.userService.findByEmail(email);

      if (!user) {
        const newUser = new UserRegisterDto();
        newUser.email = email;
        newUser.firstName = given_name || ' ';
        newUser.lastName = family_name || ' ';
        // Google users might not have a password
        newUser.password = Math.random().toString(36).slice(-8); // Generate a random password

        user = await this.userService.create(newUser);
      }

      return this.login(user);
    } catch (error) {
      throw new UnauthorizedException('Google authentication failed');
    }
  }

  async forgotPassword(
    email: string,
  ): Promise<{ message: string; token: string }> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // Token expires in 1 hour

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;

    await this.userService.save(user);

    // In a real app, you'd email this token to the user
    console.log(`Password reset token for ${email}: ${token}`);

    return { message: 'Password reset token sent.', token };
  }

  async resetPassword(
    token: string,
    newPass: string,
  ): Promise<{ message: string }> {
    const user = await this.userService.findByResetToken(token);

    if (!user) {
      throw new UnauthorizedException(
        'Password reset token is invalid or has expired.',
      );
    }

    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(newPass, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await this.userService.save(user);

    return { message: 'Password has been reset successfully.' };
  }
}
