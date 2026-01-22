/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  IsString,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
  Max,
  IsInt,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsArray,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateRoomDto {
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  name: string;

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

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return Array.isArray(value) ? value : [];
  })
  @IsArray()
  roomBeds?: { bedTypeId: number; quantity: number }[];

  @Transform(({ value }) => parseFloat(value))
  @IsOptional()
  @IsNumber()
  @IsPositive()
  roomSize?: number;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(50)
  available: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price: number;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(10)
  maxOccupancy: number;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(0)
  @Max(100)
  discountPercentage: number;

  @IsOptional()
  images: any;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    const values = Array.isArray(value) ? value : [value];
    return values.map((id) => Number(id)).filter((id) => !isNaN(id));
  })
  @IsArray({ message: 'amenityIds must be an array' })
  amenityIds?: number[];

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsOptional()
  custom_amenities?: string;

  @IsString()
  hotelId: string;
}
