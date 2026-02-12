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
   * After admin approves a booking, user has 6 hours (testing) to complete payment.
   * If payment is not completed within the time limit, booking is marked as FAILED.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredPayments() {
    const now = new Date();
    this.logger.log(`Checking for expired payments at ${now.toISOString()}...`);

    const expiryTime = new Date();
    expiryTime.setTime(expiryTime.getTime() - 6 * 60 * 60 * 1000); // 6 hours for testing
    this.logger.log(
      `Looking for CONFIRMED bookings with confirmedAt before ${expiryTime.toISOString()}`,
    );

    // Find all CONFIRMED bookings where confirmedAt is older than 6 hours
    const confirmedBookings = await this.bookingRepository.find({
      where: {
        status: BookingStatus.CONFIRMED,
        confirmedAt: LessThan(expiryTime),
      },
    });

    this.logger.log(
      `Found ${confirmedBookings.length} CONFIRMED booking(s) older than 6 hours.`,
    );

    // Check each booking for completed payment
    for (const booking of confirmedBookings) {
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
          'Payment session expired (6 hours limit - testing)';
        await this.bookingRepository.save(booking);
        this.logger.log(
          `Booking ${booking.id} marked as FAILED due to payment expiry.`,
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
