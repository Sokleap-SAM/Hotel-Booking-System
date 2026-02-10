import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsUUID,
  ValidateNested,
  ArrayMinSize,
  IsOptional,
  IsString,
} from 'class-validator';

export class RoomSelectionDto {
  @IsNotEmpty()
  @IsUUID()
  roomId: string;

  @IsNotEmpty()
  @IsDateString()
  checkIn: string;

  @IsNotEmpty()
  @IsDateString()
  checkOut: string;
}

export class CreateBookingDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RoomSelectionDto)
  roomSelections: RoomSelectionDto[];

  @IsOptional()
  @IsDateString()
  guestDateOfBirth?: string;

  @IsOptional()
  @IsString()
  guestPhone?: string;
}
