import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class CreateRatingDto {
  @IsString()
  hotelId: string;

  @IsNumber()
  @Min(1)
  @Max(10)
  staff: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  facilities: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  comfort: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  value: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  location: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  wifi: number;

  @IsString()
  @IsOptional()
  comment?: string;
}
