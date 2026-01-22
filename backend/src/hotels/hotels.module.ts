import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelsService } from './hotels.service';
import { HotelsController } from './hotels.controller';
import { Hotel } from './entities/hotel.entity';
import { AmenitiesModule } from 'src/amenities/amenities.module';
import { HotelValidatorPipe } from './pipes/hotel-validtor.pipe';

@Module({
  imports: [TypeOrmModule.forFeature([Hotel]), AmenitiesModule],
  controllers: [HotelsController],
  providers: [HotelsService, HotelValidatorPipe],
  exports: [HotelsService],
})
export class HotelsModule {}
