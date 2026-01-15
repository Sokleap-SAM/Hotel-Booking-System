import { Transform } from 'class-transformer';
import {
  IsString,
  IsEmail,
  IsUrl,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsNotEmpty,
  IsArray,
} from 'class-validator';

export class CreateHotelDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(20)
  @MaxLength(100)
  shortDescription: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(40)
  longDescription: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsUrl({}, { message: 'A valid Google Map URL is required' })
  @IsNotEmpty()
  googleMapUrl: string;

  @IsOptional()
  images: any;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed: unknown = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed as number[];
        }
        return [Number(parsed)];
      } catch {
        return [];
      }
    }
    return value as number[];
  })
  @IsArray({ message: 'amenityIds must be an array' })
  amenityIds?: number[];

  @IsString()
  @IsOptional()
  custom_amenities?: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\+?[\d\s\-\\(\\)]+$/, {
    message: 'Phone number must be valid',
  })
  phoneNumber: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}
