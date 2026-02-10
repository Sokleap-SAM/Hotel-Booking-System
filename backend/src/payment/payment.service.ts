import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Booking, BookingStatus } from 'src/booking/entities/booking.entity';
import { PaymentStatusResponseDto } from './dto/payment-response.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return this.mapToStatusResponse(payment);
  }

  async getPaymentByBooking(bookingId: string): Promise<Payment | null> {
    return this.paymentRepository.findOne({
      where: { bookingId },
      order: { createdAt: 'DESC' },
    });
  }

  async getUserPayments(userId: number): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { userId },
      relations: ['booking'],
      order: { createdAt: 'DESC' },
    });
  }

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

  // Admin methods
  async getAllPayments(
    status?: string,
    paymentMethod?: string,
  ): Promise<Payment[]> {
    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.booking', 'booking')
      .leftJoinAndSelect('payment.user', 'user')
      .orderBy('payment.createdAt', 'DESC');

    if (status) {
      queryBuilder.andWhere('payment.status = :status', { status });
    }

    if (paymentMethod) {
      queryBuilder.andWhere('payment.paymentMethod = :paymentMethod', {
        paymentMethod,
      });
    }

    return queryBuilder.getMany();
  }

  async getPaymentDetails(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: [
        'booking',
        'booking.bookingItems',
        'booking.bookingItems.room',
        'user',
      ],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }
}
