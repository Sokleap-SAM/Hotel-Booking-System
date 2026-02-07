import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from './entities/payment.entity';
import { Booking, BookingStatus } from 'src/booking/entities/booking.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import {
  KhqrPaymentResponseDto,
  CardPaymentResponseDto,
  PaymentStatusResponseDto,
} from './dto/payment-response.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  // Generate a random transaction ID for simulation
  private generateTransactionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `TXN-${timestamp}-${random}`.toUpperCase();
  }

  // Generate KHQR reference
  private generateKhqrReference(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `KHQR-${timestamp}-${random}`.toUpperCase();
  }

  // Detect card brand from card number
  private detectCardBrand(cardNumber: string): string {
    const firstDigit = cardNumber.charAt(0);
    const firstTwo = cardNumber.substring(0, 2);

    if (firstDigit === '4') return 'Visa';
    if (['51', '52', '53', '54', '55'].includes(firstTwo)) return 'Mastercard';
    if (['34', '37'].includes(firstTwo)) return 'Amex';
    if (firstTwo === '62') return 'UnionPay';
    return 'Unknown';
  }

  // Simulate KHQR payment initialization
  async initializeKhqrPayment(
    createPaymentDto: CreatePaymentDto,
    userId: number,
  ): Promise<KhqrPaymentResponseDto> {
    const booking = await this.bookingRepository.findOne({
      where: { id: createPaymentDto.bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Booking must be approved before payment');
    }

    // Check for existing pending payment
    const existingPayment = await this.paymentRepository.findOne({
      where: {
        bookingId: createPaymentDto.bookingId,
        status: PaymentStatus.PENDING,
      },
    });

    if (existingPayment) {
      throw new BadRequestException(
        'A pending payment already exists for this booking',
      );
    }

    const qrReference = this.generateKhqrReference();

    const payment = this.paymentRepository.create({
      bookingId: createPaymentDto.bookingId,
      userId,
      amount: booking.totalPrice,
      paymentMethod: PaymentMethod.KHQR,
      status: PaymentStatus.PENDING,
      qrReference,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Generate simulated QR code data (in real implementation, this would be actual KHQR data)
    const qrCodeData = this.generateSimulatedQrCode(
      qrReference,
      booking.totalPrice,
    );

    return {
      paymentId: savedPayment.id,
      qrReference,
      qrCodeData,
      amount: Number(booking.totalPrice),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiry
      status: savedPayment.status,
    };
  }

  // Generate simulated QR code data
  private generateSimulatedQrCode(reference: string, amount: number): string {
    // In real implementation, this would generate actual KHQR format
    // For simulation, we'll return a base64 placeholder or reference string
    const qrData = {
      type: 'KHQR',
      reference,
      amount,
      merchant: 'CamBook Hotel Booking',
      currency: 'USD',
    };
    return Buffer.from(JSON.stringify(qrData)).toString('base64');
  }

  // Process card payment (simulated)
  async processCardPayment(
    createPaymentDto: CreatePaymentDto,
    userId: number,
  ): Promise<CardPaymentResponseDto> {
    const booking = await this.bookingRepository.findOne({
      where: { id: createPaymentDto.bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Booking must be approved before payment');
    }

    // Validate card details
    if (
      !createPaymentDto.cardNumber ||
      !createPaymentDto.cardExpiry ||
      !createPaymentDto.cardCvv
    ) {
      throw new BadRequestException('Card details are required');
    }

    const cardLast4 = createPaymentDto.cardNumber.slice(-4);
    const cardBrand = this.detectCardBrand(createPaymentDto.cardNumber);
    const transactionId = this.generateTransactionId();

    // Create payment record
    const payment = this.paymentRepository.create({
      bookingId: createPaymentDto.bookingId,
      userId,
      amount: booking.totalPrice,
      paymentMethod: PaymentMethod.CARD,
      status: PaymentStatus.PROCESSING,
      cardLast4,
      cardBrand,
      transactionId,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Simulate payment processing (in real implementation, call payment gateway)
    const isSuccess = await this.simulateCardPayment(createPaymentDto);

    if (isSuccess) {
      savedPayment.status = PaymentStatus.COMPLETED;
      savedPayment.completedAt = new Date();
      await this.paymentRepository.save(savedPayment);

      // Update booking status to completed after payment
      await this.bookingRepository.update(booking.id, {
        status: BookingStatus.COMPLETED,
      });
    } else {
      savedPayment.status = PaymentStatus.FAILED;
      savedPayment.failureReason = 'Card payment declined (simulation)';
      await this.paymentRepository.save(savedPayment);
    }

    return {
      paymentId: savedPayment.id,
      transactionId: savedPayment.transactionId,
      amount: Number(booking.totalPrice),
      cardLast4: savedPayment.cardLast4,
      cardBrand: savedPayment.cardBrand,
      status: savedPayment.status,
    };
  }

  // Simulate card payment processing
  private async simulateCardPayment(dto: CreatePaymentDto): Promise<boolean> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // For simulation: cards ending in 0000 will fail, others succeed
    if (dto.cardNumber?.endsWith('0000')) {
      return false;
    }
    return true;
  }

  // Confirm KHQR payment (simulates receiving callback from bank)
  async confirmKhqrPayment(
    paymentId: string,
  ): Promise<PaymentStatusResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.paymentMethod !== PaymentMethod.KHQR) {
      throw new BadRequestException('This is not a KHQR payment');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment is not in pending status');
    }

    // Simulate successful payment
    payment.status = PaymentStatus.COMPLETED;
    payment.transactionId = this.generateTransactionId();
    payment.completedAt = new Date();
    await this.paymentRepository.save(payment);

    // Update booking status to completed after payment
    await this.bookingRepository.update(payment.bookingId, {
      status: BookingStatus.COMPLETED,
    });

    return this.mapToStatusResponse(payment);
  }

  // Check payment status
  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return this.mapToStatusResponse(payment);
  }

  // Get payment by booking ID
  async getPaymentByBooking(bookingId: string): Promise<Payment | null> {
    return this.paymentRepository.findOne({
      where: { bookingId },
      order: { createdAt: 'DESC' },
    });
  }

  // Get user's payment history
  async getUserPayments(userId: number): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { userId },
      relations: ['booking'],
      order: { createdAt: 'DESC' },
    });
  }

  // Cancel pending payment
  async cancelPayment(paymentId: string, userId: number): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId, userId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Only pending payments can be cancelled');
    }

    payment.status = PaymentStatus.FAILED;
    payment.failureReason = 'Cancelled by user';
    await this.paymentRepository.save(payment);
  }

  // Process refund (simulated)
  async processRefund(paymentId: string): Promise<PaymentStatusResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    // Simulate refund processing
    await new Promise((resolve) => setTimeout(resolve, 500));

    payment.status = PaymentStatus.REFUNDED;
    await this.paymentRepository.save(payment);

    // Update booking status
    await this.bookingRepository.update(payment.bookingId, {
      status: BookingStatus.CANCELLED,
    });

    return this.mapToStatusResponse(payment);
  }

  private mapToStatusResponse(payment: Payment): PaymentStatusResponseDto {
    return {
      paymentId: payment.id,
      bookingId: payment.bookingId,
      amount: Number(payment.amount),
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      transactionId: payment.transactionId,
      completedAt: payment.completedAt,
      failureReason: payment.failureReason,
    };
  }
}
