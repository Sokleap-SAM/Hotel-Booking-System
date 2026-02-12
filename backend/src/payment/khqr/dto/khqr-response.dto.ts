export class KhqrPaymentResponseDto {
  paymentId: string;
  qrReference: string;
  qrCodeData: string;
  amount: number;
  expiresAt: Date;
  status: string;
}
