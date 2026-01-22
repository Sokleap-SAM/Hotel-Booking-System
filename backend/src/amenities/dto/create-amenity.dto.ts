import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { AmenityCategory } from '../entities/amenity.entity';

export class CreateAmenityDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(AmenityCategory)
  category: AmenityCategory;
}
