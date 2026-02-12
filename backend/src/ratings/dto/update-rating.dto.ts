import { PartialType } from '@nestjs/mapped-types';
import { CreateRatingDto } from './create-rating.dto';
import { IsOptional } from 'class-validator';

export class UpdateRatingDto extends PartialType(CreateRatingDto) {
  @IsOptional()
  hotelId?: string;
}
