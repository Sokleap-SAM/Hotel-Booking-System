import {
  IsString,
  IsEmail,
  IsArray,
  IsUrl,
  MinLength,
  MaxLength,
  ArrayMinSize,
  Matches,
} from 'class-validator';

export class CreateHotelDto {
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  name: string;

  @IsString()
  @MinLength(20)
  @MaxLength(100)
  shortDescription: string;

  @IsString()
  @MinLength(50)
  longDescription: string;

  @IsString()
  location: string;

  @IsUrl()
  googleMapUrl: string;

  @IsArray()
  @ArrayMinSize(1)
  images: string[];

  @IsArray()
  @ArrayMinSize(1)
  amenities: string[];

  @IsString()
  @Matches(/^\+?[\d\s\-\\(\\)]+$/, {
    message: 'Phone number must be valid',
  })
  phoneNumber: string;

  @IsEmail()
  email: string;
}
