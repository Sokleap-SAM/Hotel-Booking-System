import {
  Injectable,
  NotFoundException,
  ConflictException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Amenity, AmenityCategory } from './entities/amenity.entity';
import { CreateAmenityDto } from './dto/create-amenity.dto';
import { UpdateAmenityDto } from './dto/update-amenity.dto';

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
        { name: 'Work Desk', category: AmenityCategory.ROOM },
        { name: 'Balcony', category: AmenityCategory.ROOM },
        { name: 'Electric kettle', category: AmenityCategory.ROOM },
        { name: 'Alarm clock', category: AmenityCategory.ROOM },
        { name: 'Telephone', category: AmenityCategory.ROOM },
        { name: 'Tea/Coffee maker', category: AmenityCategory.ROOM },
        { name: 'Terrac', category: AmenityCategory.ROOM },

        { name: 'Swimming Pool', category: AmenityCategory.HOTEL },
        { name: 'Gym', category: AmenityCategory.HOTEL },
        { name: 'Free Parking', category: AmenityCategory.HOTEL },
        { name: 'Restaurant', category: AmenityCategory.HOTEL },
        { name: 'Bar', category: AmenityCategory.HOTEL },
        { name: 'Massage', category: AmenityCategory.HOTEL },
      ];

      await this.amenityRepository.save(initialAmenities);
      console.log('Amenities initialized!');
    }
  }

  async create(createAmenityDto: CreateAmenityDto): Promise<Amenity> {
    const existing = await this.amenityRepository.findOne({
      where: { name: createAmenityDto.name },
    });

    if (existing) {
      throw new ConflictException(
        `Amenity with name "${createAmenityDto.name}" already exists`,
      );
    }

    const amenity = this.amenityRepository.create(createAmenityDto);
    return await this.amenityRepository.save(amenity);
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

  async findOne(id: number): Promise<Amenity> {
    const amenity = await this.amenityRepository.findOne({
      where: { id },
    });

    if (!amenity) {
      throw new NotFoundException(`Amenity with ID ${id} not found`);
    }

    return amenity;
  }

  async update(
    id: number,
    updateAmenityDto: UpdateAmenityDto,
  ): Promise<Amenity> {
    const amenity = await this.findOne(id);

    if (updateAmenityDto.name && updateAmenityDto.name !== amenity.name) {
      const existing = await this.amenityRepository.findOne({
        where: { name: updateAmenityDto.name },
      });

      if (existing) {
        throw new ConflictException(
          `Amenity with name "${updateAmenityDto.name}" already exists`,
        );
      }
    }

    Object.assign(amenity, updateAmenityDto);
    return await this.amenityRepository.save(amenity);
  }

  async remove(id: number): Promise<void> {
    const amenity = await this.findOne(id);
    await this.amenityRepository.remove(amenity);
  }
}
