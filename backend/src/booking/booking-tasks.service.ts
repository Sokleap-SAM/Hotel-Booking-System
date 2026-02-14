import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { Payment, PaymentStatus } from '../payment/entities/payment.entity';

@Injectable()
export class BookingTasksService {
  private readonly logger = new Logger(BookingTasksService.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  /**
   * Runs every minute to check for CONFIRMED bookings that haven't been paid.
   * After admin approves a booking, user has 1 hour to complete payment.
   * If payment is not completed within the time limit, booking is marked as FAILED
   * and reserved rooms become available again.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredPayments() {
    const now = new Date();
    this.logger.log(`Checking for expired payments at ${now.toISOString()}...`);

    // Find all CONFIRMED bookings where paymentExpiresAt has passed
    const expiredBookings = await this.bookingRepository.find({
      where: {
        status: BookingStatus.CONFIRMED,
        paymentExpiresAt: LessThan(now),
      },
    });

    this.logger.log(
      `Found ${expiredBookings.length} CONFIRMED booking(s) with expired payment deadline.`,
    );

    // Check each booking for completed payment
    for (const booking of expiredBookings) {
      const payment = await this.paymentRepository.findOne({
        where: {
          bookingId: booking.id,
          status: PaymentStatus.COMPLETED,
        },
      });

      if (!payment) {
        // No completed payment found - mark booking as FAILED
        booking.status = BookingStatus.FAILED;
        booking.rejectionReason =
          'Payment not completed within 1 hour. Reserved rooms have been released.';
        await this.bookingRepository.save(booking);
        this.logger.log(
          `Booking ${booking.id} marked as FAILED due to payment expiry. Rooms released.`,
        );
      } else {
        this.logger.log(
          `Booking ${booking.id} has completed payment, skipping.`,
        );
      }
    }

    this.logger.log('Payment expiry check completed.');
  }
}
