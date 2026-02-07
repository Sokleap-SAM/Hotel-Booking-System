import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AmenitiesService } from './amenities.service';
import { AmenitiesController } from './amenities.controller';
import { Amenity } from './entities/amenity.entity';
import { Hotel } from '../hotels/entities/hotel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Amenity, Hotel])],
  controllers: [AmenitiesController],
  providers: [AmenitiesService],
  exports: [TypeOrmModule, AmenitiesService],
})
export class AmenitiesModule {}
