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
