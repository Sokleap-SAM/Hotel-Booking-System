import {
  Controller,
  Request,
  Post,
  UseGuards,
  Get,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UserRegisterDto } from './user/dto/user-register.dto';
import { GoogleLoginDto } from './user/dto/google-login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { profileUploadConfig } from 'src/config/file-upload.config';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from './user/entity/user.entity';

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
  async login(@Request() req: { user: User }) {
    return this.authService.login(req.user);
  }

  @Post('google/login')
  async googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.authService.googleLogin(googleLoginDto.token);
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
}
