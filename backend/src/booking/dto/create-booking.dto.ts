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
  Matches,
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
  @IsDateString({}, { message: 'Date of birth must be a valid date' })
  guestDateOfBirth?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{9,10}$/, {
    message: 'Phone number must be between 9 and 10 digits',
  })
  guestPhone?: string;
}
