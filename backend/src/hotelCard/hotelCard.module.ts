import { Module } from '@nestjs/common';
import { HotelCardController } from './hotelCard.controller';
import { HotelCardService } from './hotelCard.service';

@Module({
  controllers: [HotelCardController],
  providers: [HotelCardService],
})
export class HotelCardModule {}
