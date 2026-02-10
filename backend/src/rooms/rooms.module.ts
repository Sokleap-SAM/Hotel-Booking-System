import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { Room } from './entities/room.entity';
import { RoomBed } from './entities/room-bed.entity';
import { Hotel } from '../hotels/entities/hotel.entity';
import { BookingItem } from '../booking/entities/booking-item.entity';
import { AmenitiesModule } from 'src/amenities/amenities.module';
import { BedTypesModule } from 'src/bed-types/bed-types.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room, RoomBed, Hotel, BookingItem]),
    AmenitiesModule,
    BedTypesModule,
  ],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}
