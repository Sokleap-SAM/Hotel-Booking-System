import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { Booking } from './entities/booking.entity';
import { Room } from '../rooms/entities/room.entity';
import { BookingItem } from './entities/booking-item.entity';
import { RoomsModule } from '../rooms/rooms.module';
import { BookingTasksService } from './booking-tasks.service';
import { Payment } from '../payment/entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Room, BookingItem, Payment]),
    RoomsModule,
  ],
  controllers: [BookingController],
  providers: [BookingService, BookingTasksService],
  exports: [BookingService],
})
export class BookingModule {}
