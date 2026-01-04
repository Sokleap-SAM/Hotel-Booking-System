import { Controller, Get, Param } from '@nestjs/common';
import { AmenitiesService } from './amenities.service';
import { AmenityCategory } from './entities/amenity.entity';

@Controller('amenities')
export class AmenitiesController {
  constructor(private readonly amenitiesService: AmenitiesService) {}

  @Get()
  findAll() {
    return this.amenitiesService.findAll();
  }

  @Get('category/:category')
  findByCategory(@Param('category') category: AmenityCategory) {
    return this.amenitiesService.findByCategory(category);
  }
}
