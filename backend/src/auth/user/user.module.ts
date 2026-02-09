import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { RoleSeeder } from './seeders/role.seeder';
import { AdminSeeder } from './seeders/admin.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, UserRole])],
  providers: [UserService, RoleSeeder, AdminSeeder],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
