import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Amenity, AmenityCategory } from './entities/amenity.entity';

@Injectable()
export class AmenitiesService implements OnModuleInit {
  constructor(
    @InjectRepository(Amenity)
    private amenityRepository: Repository<Amenity>,
  ) {}

  async onModuleInit() {
    const count = await this.amenityRepository.count();

    if (count === 0) {
      const initialAmenities = [
        { name: 'Free Wi-Fi', category: AmenityCategory.ROOM },
        { name: 'Air Conditioning', category: AmenityCategory.ROOM },
        { name: 'Smart TV', category: AmenityCategory.ROOM },
        { name: 'Mini Bar', category: AmenityCategory.ROOM },
        { name: 'Work Desk', category: AmenityCategory.ROOM },

        { name: 'Swimming Pool', category: AmenityCategory.HOTEL },
        { name: 'Gym', category: AmenityCategory.HOTEL },
        { name: 'Free Parking', category: AmenityCategory.HOTEL },
        { name: 'Restaurant', category: AmenityCategory.HOTEL },
      ];

      await this.amenityRepository.save(initialAmenities);
      console.log('Amenities initialized!');
    }
  }

  async findByCategory(category: AmenityCategory): Promise<Amenity[]> {
    return await this.amenityRepository.find({
      where: { category },
      order: { name: 'ASC' },
    });
  }

  async findAll(): Promise<Amenity[]> {
    return await this.amenityRepository.find({
      order: { category: 'ASC', name: 'ASC' },
    });
  }
}
