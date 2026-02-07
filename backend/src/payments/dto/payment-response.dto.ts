export class KhqrPaymentResponseDto {
  paymentId: string;
  qrReference: string;
  qrCodeData: string;
  amount: number;
  expiresAt: Date;
  status: string;
}

export class CardPaymentResponseDto {
  paymentId: string;
  transactionId: string;
  amount: number;
  cardLast4: string;
  cardBrand: string;
  status: string;
}

export class PaymentStatusResponseDto {
  paymentId: string;
  bookingId: string;
  amount: number;
  paymentMethod: string;
  status: string;
  transactionId?: string;
  completedAt?: Date;
  failureReason?: string;
}
