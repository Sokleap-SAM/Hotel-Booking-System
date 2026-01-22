import { IsInt, IsPositive, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class RoomBedDto {
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @IsPositive()
  bedTypeId: number;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(10)
  quantity: number;
}
