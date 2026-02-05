import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { UserRegisterDto } from './dto/user-register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userRegisterDto: UserRegisterDto): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(userRegisterDto.password, salt);
    const { password, ...userData } = userRegisterDto;

    console.log('UserService.create: userRegisterDto received:', userRegisterDto);

    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    console.log('UserService.create: User entity created:', user);

    try {
      const savedUser = await this.userRepository.save(user);
      console.log('UserService.create: User saved successfully:', savedUser);
      return savedUser;
    } catch (error) {
      console.error('UserService.create: Error saving user to database:', error);
      throw error; // Re-throw the error to ensure it's still handled by NestJS
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
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
