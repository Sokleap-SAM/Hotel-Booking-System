import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AmenitiesService } from './amenities.service';
import { AmenitiesController } from './amenities.controller';
import { Amenity } from './entities/amenity.entity';
import { Hotel } from '../hotels/entities/hotel.entity';
import { Room } from '../rooms/entities/room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Amenity, Hotel, Room])],
  controllers: [AmenitiesController],
  providers: [AmenitiesService],
  exports: [TypeOrmModule, AmenitiesService],
})
export class AmenitiesModule {}
