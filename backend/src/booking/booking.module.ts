import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { Booking } from './entities/booking.entity';
import { Room } from '../rooms/entities/room.entity';
import { BookingItem } from './entities/booking-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Room, BookingItem])],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
