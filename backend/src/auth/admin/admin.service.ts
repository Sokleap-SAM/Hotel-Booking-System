/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, NotFoundException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { Role } from '../user/entities/role.entity';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AdminService {
  constructor(private readonly userService: UserService) {}

  async getAllUsers(queryDto: QueryUserDto): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.userService.findAll({
      page: queryDto.page,
      limit: queryDto.limit,
      search: queryDto.search,
      role: queryDto.role,
      isActive: queryDto.isActive,
      sortBy: queryDto.sortBy,
      sortOrder: queryDto.sortOrder,
    });
  }

  async createUser(createDto: CreateUserDto): Promise<User> {
    return this.userService.createWithRoles(createDto);
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async updateUser(id: number, updateDto: UpdateUserDto): Promise<User> {
    return this.userService.update(id, updateDto);
  }

  async deleteUser(id: number): Promise<{ message: string }> {
    return this.userService.delete(id);
  }

  async updateUserRoles(id: number, roleIds: number[]): Promise<User> {
    return this.userService.updateUserRoles(id, roleIds);
  }

  async updateUserStatus(id: number, isActive: boolean): Promise<User> {
    return this.userService.updateStatus(id, isActive);
  }

  async getAllRoles(): Promise<Role[]> {
    return this.userService.getAllRoles();
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    usersByRole: { role: string; count: number }[];
  }> {
    return this.userService.getUserStats();
  }
}
