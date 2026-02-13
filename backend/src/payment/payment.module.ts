import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Payment } from './entities/payment.entity';
import { Booking } from 'src/booking/entities/booking.entity';
import { StripeModule } from './stripe/stripe.module';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Booking]), StripeModule],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
