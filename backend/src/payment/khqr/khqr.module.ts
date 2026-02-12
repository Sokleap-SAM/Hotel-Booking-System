import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KhqrService } from './khqr.service';
import { KhqrController } from './khqr.controller';
import { Payment } from '../entities/payment.entity';
import { Booking } from 'src/booking/entities/booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Booking])],
  controllers: [KhqrController],
  providers: [KhqrService],
  exports: [KhqrService],
})
export class KhqrModule {}
