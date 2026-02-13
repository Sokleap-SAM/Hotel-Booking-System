import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Amenity, AmenityCategory } from './entities/amenity.entity';
import { CreateAmenityDto } from './dto/create-amenity.dto';
import { UpdateAmenityDto } from './dto/update-amenity.dto';
import { Hotel } from '../hotels/entities/hotel.entity';
import { Room } from '../rooms/entities/room.entity';

@Injectable()
export class AmenitiesService implements OnModuleInit {
  constructor(
    @InjectRepository(Amenity)
    private amenityRepository: Repository<Amenity>,
    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
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

  async remove(id: number): Promise<{ message: string }> {
    const amenity = await this.amenityRepository.findOne({
      where: { id },
      relations: ['hotels', 'rooms'],
    });

    if (!amenity) {
      throw new NotFoundException(`Amenity with ID ${id} not found`);
    }

    // Check if any rooms are using this amenity
    if (amenity.rooms && amenity.rooms.length > 0) {
      const roomNames = amenity.rooms.map((r) => r.name).join(', ');
      throw new BadRequestException(
        `Cannot delete amenity '${amenity.name}' because it is used by ${amenity.rooms.length} room(s): ${roomNames}`,
      );
    }

    // Get hotel IDs that will be affected
    const affectedHotelIds = amenity.hotels?.map((h) => h.id) || [];

    // Simply remove the amenity - ManyToMany relations will be automatically cleaned up
    await this.amenityRepository.remove(amenity);

    // Auto-disable hotels with 0 amenities after deletion
    if (affectedHotelIds.length > 0) {
      for (const hotelId of affectedHotelIds) {
        const hotel = await this.hotelRepository.findOne({
          where: { id: hotelId },
          relations: ['amenities'],
        });

        if (hotel && hotel.amenities.length === 0) {
          hotel.isActive = false;
          await this.hotelRepository.save(hotel);
          console.log(
            `Hotel "${hotel.name}" has been disabled due to having no amenities`,
          );
        }
      }
    }

    return {
      message: `Amenity "${amenity.name}" deleted successfully`,
    };
  }
}
