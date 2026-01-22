import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBedTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
