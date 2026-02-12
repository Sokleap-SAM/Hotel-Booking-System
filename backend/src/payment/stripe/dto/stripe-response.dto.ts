export class StripeCheckoutResponseDto {
  paymentId: string;
  checkoutUrl: string;
  sessionId: string;
  amount: number;
  currency: string;
  status: string;
}
