/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { IsString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProfileDto {
  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @IsString()
  firstName?: string;

  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  profileImage?: string; // This will be the path to the new image
}
