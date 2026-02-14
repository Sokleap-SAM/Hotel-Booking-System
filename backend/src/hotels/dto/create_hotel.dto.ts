/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Transform } from 'class-transformer';
import {
  IsString,
  IsEmail,
  IsUrl,
  MinLength,
  MaxLength,
  IsOptional,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  IsEnum,
} from 'class-validator';
import { Destination } from '../entities/hotel.entity';

export class CreateHotelDto {
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  name: string;

  @IsNotEmpty()
  @IsEnum(Destination, { message: 'Invalid destination' })
  destination: Destination;

  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @IsString()
  @MinLength(20)
  @MaxLength(100)
  shortDescription: string;

  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @IsString()
  @MinLength(40)
  longDescription: string;

  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @IsString()
  location: string;

  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @IsUrl({}, { message: 'A valid Google Map URL is required' })
  googleMapUrl: string;

  @IsOptional()
  images: any;

  @Transform(({ value }) => {
    if (!value) return [];
    const values = Array.isArray(value) ? value : [value];
    return values.map((id) => Number(id)).filter((id) => !isNaN(id));
  })
  @IsNotEmpty()
  @IsArray({ message: 'amenityIds must be an array' })
  @ArrayMinSize(1, { message: 'You must select at least one amenity' })
  amenityIds: number[];

  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
