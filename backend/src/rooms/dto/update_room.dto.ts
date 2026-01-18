/* eslint-disable @typescript-eslint/no-unsafe-return */
import { PartialType } from '@nestjs/mapped-types';
import { CreateRoomDto } from './create_room.dto';
import { Transform } from 'class-transformer';
import { IsArray, IsOptional } from 'class-validator';

export class UpdateRoomDto extends PartialType(CreateRoomDto) {
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  })
  @IsArray()
  existingImages?: string[];
}
