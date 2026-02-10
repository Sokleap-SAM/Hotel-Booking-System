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
} from '../entities/payment.entity';
import { Booking, BookingStatus } from 'src/booking/entities/booking.entity';
import { CreateKhqrPaymentDto } from './dto/create-khqr-payment.dto';
import { KhqrPaymentResponseDto } from './dto/khqr-response.dto';
import { PaymentStatusResponseDto } from '../dto/payment-response.dto';

@Injectable()
export class KhqrService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  private generateTransactionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `TXN-${timestamp}-${random}`.toUpperCase();
  }

  private generateKhqrReference(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `KHQR-${timestamp}-${random}`.toUpperCase();
  }

  private generateSimulatedQrCode(reference: string, amount: number): string {
    const qrData = {
      type: 'KHQR',
      reference,
      amount,
      merchant: 'CamBook Hotel Booking',
      currency: 'USD',
    };
    return Buffer.from(JSON.stringify(qrData)).toString('base64');
  }

  async initializeKhqrPayment(
    dto: CreateKhqrPaymentDto,
    userId: number,
  ): Promise<KhqrPaymentResponseDto> {
    const booking = await this.bookingRepository.findOne({
      where: { id: dto.bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Booking must be approved before payment');
    }

    const existingPayment = await this.paymentRepository.findOne({
      where: {
        bookingId: dto.bookingId,
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
      bookingId: dto.bookingId,
      userId,
      amount: booking.totalPrice,
      paymentMethod: PaymentMethod.KHQR,
      status: PaymentStatus.PENDING,
      qrReference,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    const qrCodeData = this.generateSimulatedQrCode(
      qrReference,
      booking.totalPrice,
    );

    return {
      paymentId: savedPayment.id,
      qrReference,
      qrCodeData,
      amount: Number(booking.totalPrice),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      status: savedPayment.status,
    };
  }

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

    payment.status = PaymentStatus.COMPLETED;
    payment.transactionId = this.generateTransactionId();
    payment.completedAt = new Date();
    await this.paymentRepository.save(payment);

    await this.bookingRepository.update(payment.bookingId, {
      status: BookingStatus.COMPLETED,
    });

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
