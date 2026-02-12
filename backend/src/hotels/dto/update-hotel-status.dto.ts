import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateHotelStatusDto {
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}
