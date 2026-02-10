import { IsString, IsNotEmpty } from 'class-validator';

export class CreateKhqrPaymentDto {
  @IsString()
  @IsNotEmpty()
  bookingId: string;
}
