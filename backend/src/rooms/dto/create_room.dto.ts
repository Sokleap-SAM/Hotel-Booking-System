import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsPositive,
  Min,
  Max,
  IsInt,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @IsString()
  @MinLength(20)
  @MaxLength(150)
  shortDescription: string;

  @IsString()
  @MinLength(50)
  longDescription: string;

  @IsString()
  type: string;

  @IsInt()
  @Min(0)
  @Max(50)
  available: number;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsInt()
  @Min(1)
  @Max(10)
  maxOccupancy: number;

  @IsInt()
  @Min(0)
  @Max(100)
  discountPercentage: number;

  @IsArray()
  images: string[];

  @IsArray()
  amenities: string[];

  @IsString()
  @IsOptional()
  otherAmenities?: string;

  @IsString()
  hotelId: string;
}
