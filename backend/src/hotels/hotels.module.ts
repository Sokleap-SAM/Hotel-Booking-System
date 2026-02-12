import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelsService } from './hotels.service';
import { HotelsController } from './hotels.controller';
import { Hotel } from './entities/hotel.entity';
import { BookingItem } from '../booking/entities/booking-item.entity';
import { AmenitiesModule } from 'src/amenities/amenities.module';
import { HotelValidatorPipe } from './pipes/hotel-validator.pipe';

@Module({
  imports: [TypeOrmModule.forFeature([Hotel, BookingItem]), AmenitiesModule],
  controllers: [HotelsController],
  providers: [HotelsService, HotelValidatorPipe],
  exports: [HotelsService],
})
export class HotelsModule {}
