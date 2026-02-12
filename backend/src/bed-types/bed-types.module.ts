import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BedTypesService } from './bed-types.service';
import { BedTypesController } from './bed-types.controller';
import { BedType } from './entities/bed-type.entity';
import { RoomBed } from '../rooms/entities/room-bed.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BedType, RoomBed])],
  controllers: [BedTypesController],
  providers: [BedTypesService],
  exports: [BedTypesService],
})
export class BedTypesModule {}
