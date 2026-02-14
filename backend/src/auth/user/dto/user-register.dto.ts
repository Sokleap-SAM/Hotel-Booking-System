/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsInt,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UserRegisterDto {
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @Transform(({ value }) => value?.trim())
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  confirmPassword: string;

  @IsString()
  @IsOptional()
  profileImage?: string;

  @IsString()
  @IsOptional()
  provider?: 'local' | 'google';

  @IsOptional()
  @IsInt()
  roleId?: number;
}
