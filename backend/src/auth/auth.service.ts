import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './user/entities/user.entity';
import { UserRegisterDto } from './user/dto/user-register.dto';
import * as crypto from 'crypto';
import { Express } from 'express';
import 'multer';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (
      user &&
      user.provider === 'local' &&
      (await bcrypt.compare(pass, user.password))
    ) {
      if (!user.isActive) {
        throw new ForbiddenException(
          'Your account has been deactivated. Please contact the administrator.',
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async validateOAuthLogin(
    email: string,
    provider: 'google',
    firstName: string,
    lastName: string,
  ): Promise<User> {
    let user = await this.userService.findByEmail(email);
    if (user) {
      if (!user.isActive) {
        throw new ForbiddenException(
          'Your account has been deactivated. Please contact the administrator.',
        );
      }
      return user;
    }

    // Create a new user if they don't exist
    const newUserDto = new UserRegisterDto();
    newUserDto.email = email;
    newUserDto.provider = provider;
    // For OAuth users, we can generate a random password or leave it null
    // if your user entity and logic allows it.
    newUserDto.password = crypto.randomBytes(16).toString('hex');

    newUserDto.firstName = firstName || ' '; // Use the passed firstName, default to space
    newUserDto.lastName = lastName || ' '; // Use the passed lastName, default to space

    console.log('validateOAuthLogin: newUserDto before creation:', newUserDto);

    try {
      user = await this.userService.create(newUserDto);
      console.log('validateOAuthLogin: User created successfully:', user);
    } catch (error) {
      console.error('validateOAuthLogin: Error creating user:', error);
      throw error; // Re-throw the error to ensure it's still handled by NestJS
    }
    return user;
  }

  login(user: User) {
    const payload = {
      email: user.email,
      sub: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  googleLogin(user: User) {
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.login(user);
  }
  async register(userDto: UserRegisterDto, file: Express.Multer.File) {
    console.log('=== BACKEND SERVICE ===');
    console.log('📁 File:', file ? 'EXISTS' : 'NULL');
    console.log('📁 File path:', file?.path);
    console.log('📝 DTO before:', userDto);
    if (
      userDto.confirmPassword &&
      userDto.password !== userDto.confirmPassword
    ) {
      throw new BadRequestException('Passwords do not match');
    }
    const existingUser = await this.userService.findByEmail(userDto.email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }
    if (file) {
      userDto.profileImage = file.path;
      console.log(file.path);
    }
    userDto.provider = 'local';
    return this.userService.create(userDto);
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

  async changePassword(
    userId: number,
    newPass: string,
  ): Promise<{ message: string }> {
    const user = await this.userService.findById(userId);

    if (!user || user.provider !== 'local') {
      throw new UnauthorizedException(
        'User not found or cannot change password this way.',
      );
    }

    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(newPass, salt);

    await this.userService.save(user);

    return { message: 'Password has been changed successfully.' };
  }

  async updateProfile(
    userId: number,
    updateProfileDto: UpdateProfileDto,
    file?: Express.Multer.File, // Make file optional
  ): Promise<User> {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    // Update fields if provided
    if (updateProfileDto.firstName) {
      user.firstName = updateProfileDto.firstName;
    }
    if (updateProfileDto.lastName) {
      user.lastName = updateProfileDto.lastName;
    }
    if (file) {
      user.profileImage = `/uploads/profiles/${file.filename}`;
    } else if (updateProfileDto.profileImage === null) {
      // Allow setting profileImage to null if explicitly requested (e.g., removing existing image)
      user.profileImage = null;
    }

    await this.userService.save(user);
    return user;
  }
}
