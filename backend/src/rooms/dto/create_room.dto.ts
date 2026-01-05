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
  IsEnum,
} from 'class-validator';
import { RoomCategory } from '../entities/room.entity';

export class CreateRoomDto {
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  name: string;

  @IsString()
  @MinLength(20)
  @MaxLength(100)
  shortDescription: string;

  @IsString()
  @MinLength(40)
  longDescription: string;

  @IsEnum(RoomCategory, {
    message:
      'Room type must be a valid category (Single, Double, Twin, Deluxe, Suite, Penthouse)',
  })
  type: RoomCategory;

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

  @IsOptional()
  images: any;

  @IsOptional()
  amenityIds: any;

  @IsString()
  @IsOptional()
  custom_amenities: string;

  @IsString()
  hotelId: string;
}
