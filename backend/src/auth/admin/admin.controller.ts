import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';
import { QueryUserDto } from './dto/query-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRolesDto } from './dto/update-user-roles.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorator/roles.dectorator';
import { profileUploadConfig, getFilePath } from '../../config/file-upload.config';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async getAllUsers(@Query() queryDto: QueryUserDto) {
    return this.adminService.getAllUsers(queryDto);
  }

  @Post('users')
  @UseInterceptors(FileInterceptor('profileImage', profileUploadConfig))
  async createUser(
    @Body() createDto: CreateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const profileImage = file ? getFilePath(file, 'profiles') : null;
    return this.adminService.createUser(createDto, profileImage);
  }

  @Get('users/stats')
  async getUserStats() {
    return this.adminService.getUserStats();
  }

  @Get('roles')
  async getAllRoles() {
    return this.adminService.getAllRoles();
  }

  @Get('users/:id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getUserById(id);
  }

  @Patch('users/:id')
  @UseInterceptors(FileInterceptor('profileImage', profileUploadConfig))
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      updateDto.profileImage = getFilePath(file, 'profiles');
    } else if (updateDto.removeProfileImage) {
      updateDto.profileImage = null;
    }
    return this.adminService.updateUser(id, updateDto);
  }

  @Patch('users/:id/roles')
  async updateUserRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRolesDto: UpdateUserRolesDto,
  ) {
    return this.adminService.updateUserRoles(id, updateRolesDto.roleIds);
  }

  @Patch('users/:id/status')
  async updateUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(id, updateStatusDto.isActive);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteUser(id);
  }
}
