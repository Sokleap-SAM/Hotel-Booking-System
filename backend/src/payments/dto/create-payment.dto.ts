import {
  IsString,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  Matches,
  Length,
} from 'class-validator';
import { PaymentMethod } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  @Length(16, 16, { message: 'Card number must be 16 digits' })
  @Matches(/^\d+$/, { message: 'Card number must contain only digits' })
  cardNumber?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, {
    message: 'Expiry must be in MM/YY format',
  })
  cardExpiry?: string;

  @IsOptional()
  @IsString()
  @Length(3, 4, { message: 'CVV must be 3 or 4 digits' })
  @Matches(/^\d+$/, { message: 'CVV must contain only digits' })
  cardCvv?: string;

  @IsOptional()
  @IsString()
  cardHolderName?: string;
}
