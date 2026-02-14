/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { AmenityCategory } from '../entities/amenity.entity';

export class CreateAmenityDto {
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(AmenityCategory)
  category: AmenityCategory;
}
