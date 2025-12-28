import { PartialType } from '@nestjs/mapped-types';
import { CreateHotelDto } from './create_hotel.dto';

export class UpdateHotelDto extends PartialType(CreateHotelDto) {}
