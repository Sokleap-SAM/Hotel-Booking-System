import { PartialType } from '@nestjs/mapped-types';
import { CreateHotelDto } from './create_hotel.dto';
import { IsArray, IsOptional } from 'class-validator';

export class UpdateHotelDto extends PartialType(CreateHotelDto) {
  @IsOptional()
  @IsArray()
  existingImages?: string[];
}
