/* eslint-disable @typescript-eslint/no-unsafe-return */
import { PartialType } from '@nestjs/mapped-types';
import { CreateHotelDto } from './create_hotel.dto';
import { IsArray, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateHotelDto extends PartialType(CreateHotelDto) {
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string' && value.startsWith('[')) {
      try {
        return JSON.parse(value);
      } catch {
        return [value];
      }
    }
    if (
      typeof value === 'string' &&
      value !== 'undefined' &&
      value !== 'null'
    ) {
      return [value];
    }
    return [];
  })
  existingImages?: string | string[];
}
