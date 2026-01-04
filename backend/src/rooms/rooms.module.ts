import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { Room } from './entities/room.entity';
import { Hotel } from '../hotels/entities/hotel.entity';
import { AmenitiesModule } from 'src/amenities/amenities.module';

@Module({
  imports: [TypeOrmModule.forFeature([Room, Hotel]), AmenitiesModule],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}
