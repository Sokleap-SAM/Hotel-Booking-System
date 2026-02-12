import {
  Controller,
  Request,
  Post,
  UseGuards,
  Get,
  Body,
  UseInterceptors,
  UploadedFile,
  Res,
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UserRegisterDto } from './user/dto/user-register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto'; // Import the new DTO
import { profileUploadConfig } from 'src/config/file-upload.config';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from './user/entities/user.entity';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('profileImage', profileUploadConfig))
  async register(
    @UploadedFile() file: Express.Multer.File,
    @Body() userRegisterDto: UserRegisterDto,
  ) {
    console.log('📁 File received:', file ? file.filename : 'NO FILE');
    console.log('📁 File path:', file?.path);
    return this.authService.register(userRegisterDto, file);
  }

  // This Guard triggers the LocalStrategy
  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Request() req: { user: User }) {
    return this.authService.login(req.user);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Guard redirects
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Request() req: { user: User }, @Res() res: Response) {
    const { access_token } = this.authService.googleLogin(req.user);
    // Redirect to your frontend application with the token
    // In a real app, you would have the frontend URL in your config
    res.redirect(`http://localhost:5173/login/success?token=${access_token}`);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req: { user: User }) {
    // req.user is populated by the JwtStrategy
    return req.user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('change-password') // Use Patch for partial updates
  async changePassword(
    @Request() req: { user: User },
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      req.user.id,
      changePasswordDto.newPassword,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  @UseInterceptors(FileInterceptor('profileImage', profileUploadConfig))
  async updateProfile(
    @Request() req: { user: User },
    @UploadedFile() file: Express.Multer.File,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(req.user.id, updateProfileDto, file);
  }
}
