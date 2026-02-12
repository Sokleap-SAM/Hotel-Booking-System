/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository, Like, In } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { UserRegisterDto } from './dto/user-register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  async create(userRegisterDto: UserRegisterDto): Promise<User> {
    const existingUser = await this.findByEmail(userRegisterDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(userRegisterDto.password, salt);
    const { password, ...userData } = userRegisterDto;

    console.log(
      'UserService.create: userRegisterDto received:',
      userRegisterDto,
    );

    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    console.log('UserService.create: User entity created:', user);

    try {
      const savedUser = await this.userRepository.save(user);
      console.log('UserService.create: User saved successfully:', savedUser);

      // Assign default "user" role
      const userRole = await this.roleRepository.findOne({
        where: { name: 'user' },
      });

      if (userRole) {
        const userRoleAssignment = this.userRoleRepository.create({
          user: savedUser,
          role: userRole,
        });
        await this.userRoleRepository.save(userRoleAssignment);
        console.log('UserService.create: Default role "user" assigned');
      } else {
        console.warn(
          'UserService.create: Role "user" not found in database. Run role seeder first!',
        );
      }

      return savedUser;
    } catch (error) {
      console.error(
        'UserService.create: Error saving user to database:',
        error,
      );
      throw error; // Re-throw the error to ensure it's still handled by NestJS
    }
  }

  async createWithRoles(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    roleIds: number[];
    isActive?: boolean;
    profileImage?: string | null;
  }): Promise<User> {
    // Check if email already exists
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Validate roles exist
    const roles = await this.roleRepository.findBy({ id: In(data.roleIds) });
    if (roles.length !== data.roleIds.length) {
      throw new NotFoundException('One or more roles not found');
    }

    // Check if trying to assign admin role
    const hasAdminRole = roles.some(
      (role) => role.name.toLowerCase() === 'admin',
    );
    if (hasAdminRole) {
      throw new ForbiddenException(
        'Users cannot be assigned admin role through this operation',
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(data.password, salt);

    // Create user
    const user = this.userRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      provider: 'local',
      isActive: data.isActive ?? true,
      profileImage: data.profileImage ?? null,
    });

    const savedUser = await this.userRepository.save(user);

    // Assign roles
    const userRoles = roles.map((role) =>
      this.userRoleRepository.create({ user: savedUser, role }),
    );
    await this.userRoleRepository.save(userRoles);

    // Return user with roles
    const userWithRoles = await this.findById(savedUser.id);
    if (!userWithRoles) {
      throw new NotFoundException('User not found after creation');
    }
    return userWithRoles;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.role'],
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.role'],
    });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: MoreThan(new Date()),
      },
    });
  }

  async save(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = options;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'userRole')
      .leftJoinAndSelect('userRole.role', 'role');

    // Search by name or email
    if (search) {
      queryBuilder.andWhere(
        '(user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filter by role
    if (role) {
      queryBuilder.andWhere('role.name = :role', { role });
    }

    // Filter by active status
    if (isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive });
    }

    // Apply sorting
    const allowedSortFields = [
      'id',
      'firstName',
      'lastName',
      'email',
      'createdAt',
      'updatedAt',
    ];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`user.${sortField}`, sortOrder);

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: number, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Prevent updating personal info for Google-connected users
    if (user.provider === 'google') {
      const restrictedFields = ['firstName', 'lastName', 'email', 'password'];
      const attemptedRestrictedFields = restrictedFields.filter(
        (field) => updateData[field as keyof typeof updateData] !== undefined,
      );

      if (attemptedRestrictedFields.length > 0) {
        throw new ForbiddenException(
          'Cannot modify personal information for users connected with Google. Only status can be changed.',
        );
      }
    }

    // Hash password if provided
    if (updateData.password) {
      const salt = await bcrypt.genSalt();
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    // Check for email uniqueness if email is being updated
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.findByEmail(updateData.email);
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  async delete(id: number): Promise<{ message: string }> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.remove(user);
    return { message: `User with ID ${id} has been deleted` };
  }

  async updateUserRoles(id: number, roleIds: number[]): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Find all roles by IDs
    const roles = await this.roleRepository.findBy({ id: In(roleIds) });
    if (roles.length !== roleIds.length) {
      throw new NotFoundException('One or more roles not found');
    }

    // Check if trying to assign admin role
    const hasAdminRole = roles.some(
      (role) => role.name.toLowerCase() === 'admin',
    );
    if (hasAdminRole) {
      throw new ForbiddenException(
        'Users cannot be promoted to admin role through this operation',
      );
    }

    // Remove existing user roles
    await this.userRoleRepository.delete({ user: { id } });

    // Create new user roles
    const userRoles = roles.map((role) =>
      this.userRoleRepository.create({ user, role }),
    );
    await this.userRoleRepository.save(userRoles);

    const updatedUser = await this.findById(id);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found after update`);
    }
    return updatedUser;
  }

  async updateStatus(id: number, isActive: boolean): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    user.isActive = isActive;
    return this.userRepository.save(user);
  }

  async getAllRoles(): Promise<Role[]> {
    return this.roleRepository.find();
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    usersByRole: { role: string; count: number }[];
  }> {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({
      where: { isActive: true },
    });
    const inactiveUsers = await this.userRepository.count({
      where: { isActive: false },
    });

    const usersByRoleRaw: { role: string; count: string }[] =
      await this.userRoleRepository
        .createQueryBuilder('ur')
        .leftJoin('ur.role', 'role')
        .select('role.name', 'role')
        .addSelect('COUNT(ur.id)', 'count')
        .groupBy('role.name')
        .getRawMany();

    const usersByRole = usersByRoleRaw.map((item) => ({
      role: item.role,
      count: parseInt(item.count, 10),
    }));

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      usersByRole,
    };
  }
}
