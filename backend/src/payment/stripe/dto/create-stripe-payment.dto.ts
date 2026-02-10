import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateStripePaymentDto {
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @IsOptional()
  @IsUrl()
  successUrl?: string;

  @IsOptional()
  @IsUrl()
  cancelUrl?: string;
}
