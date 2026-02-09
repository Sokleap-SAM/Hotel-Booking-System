/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
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
}
