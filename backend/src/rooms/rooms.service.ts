import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Room, RoomCategory } from './entities/room.entity';
import { Hotel } from '../hotels/entities/hotel.entity';
import { CreateRoomDto } from './dto/create_room.dto';
import { UpdateRoomDto } from './dto/update_room.dto';
import {
  Amenity,
  AmenityCategory,
} from 'src/amenities/entities/amenity.entity';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
    @InjectRepository(Hotel)
    private hotelsRepository: Repository<Hotel>,
    @InjectRepository(Amenity)
    private readonly amenitiesRepo: Repository<Amenity>,
  ) {}

  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    const { hotelId, amenityIds, ...roomData } = createRoomDto;

    if (!amenityIds?.length && !createRoomDto.custom_amenities?.trim()) {
      throw new BadRequestException(
        'Provide at least one standard or custom amenity.',
      );
    }

    const amenities = amenityIds?.length
      ? await this.amenitiesRepo.find({
          where: {
            id: In(amenityIds),
            category: AmenityCategory.ROOM,
          },
        })
      : [];

    if (amenityIds?.length && amenities.length !== amenityIds.length) {
      throw new BadRequestException(
        'One or more selected amenities are not valid for rooms.',
      );
    }

    const hotel = await this.hotelsRepository.findOneBy({ id: hotelId });
    if (!hotel) throw new NotFoundException(`Hotel ${hotelId} not found`);

    const room = this.roomsRepository.create({ ...roomData, hotel, amenities });
    return await this.roomsRepository.save(room);
  }

  async findOne(id: string): Promise<Room> {
    const room = await this.roomsRepository.findOne({
      where: { id },
      relations: ['hotel', 'amenities'],
    });

    if (!room) {
      throw new NotFoundException(`Room ${id} not found`);
    }

    return room;
  }

  async findByHotel(hotelId: string): Promise<any[]> {
    const rooms = await this.roomsRepository.find({
      where: { hotelId },
      relations: ['hotel', 'amenities'],
      order: { price: 'ASC' },
    });

    return rooms.map((room) => ({
      ...room,
      hotel: { name: room.hotel?.name },
    }));
  }

  async update(id: string, updateRoomDto: UpdateRoomDto): Promise<Room> {
    const room = await this.roomsRepository.findOne({
      where: { id },
      relations: ['amenities'],
    });
    if (!room) throw new NotFoundException(`Room ${id} not found`);

    const { hotelId, amenityIds, ...rest } = updateRoomDto;

    const finalAmenityIds =
      amenityIds !== undefined ? amenityIds : room.amenities;
    const finalCustom =
      updateRoomDto.custom_amenities !== undefined
        ? updateRoomDto.custom_amenities
        : room.custom_amenities;

    if (
      (!finalAmenityIds ||
        (Array.isArray(finalAmenityIds) && finalAmenityIds.length === 0)) &&
      !finalCustom?.trim()
    ) {
      throw new BadRequestException(
        'Room must have at least one standard or custom amenity.',
      );
    }

    if (hotelId && hotelId !== room.hotelId) {
      const hotel = await this.hotelsRepository.findOneBy({ id: hotelId });
      if (!hotel) throw new NotFoundException(`Hotel ${hotelId} not found`);
      room.hotel = hotel;
    }

    if (amenityIds) {
      const validAmenities = await this.amenitiesRepo.find({
        where: {
          id: In(amenityIds),
          category: AmenityCategory.ROOM,
        },
      });

      if (validAmenities.length !== amenityIds.length) {
        throw new BadRequestException(
          'One or more selected amenities are not valid for rooms.',
        );
      }
      room.amenities = validAmenities;
    }

    Object.assign(room, rest);
    return await this.roomsRepository.save(room);
  }

  async remove(id: string): Promise<{ message: string }> {
    const room = await this.findOne(id);
    await this.roomsRepository.remove(room);

    return {
      message: `Room ${id} deleted successfully`,
    };
  }

  async findAvailable(): Promise<Room[]> {
    return await this.roomsRepository.find({
      where: { available: 1 },
      relations: ['hotel'],
      order: { price: 'ASC' },
    });
  }

  async findDiscounted(minDiscount: number = 10): Promise<Room[]> {
    return await this.roomsRepository.find({
      where: {
        discountPercentage: minDiscount,
        available: 1,
      },
      relations: ['hotel'],
      order: { discountPercentage: 'DESC' },
    });
  }

  async findByCategory(category: RoomCategory): Promise<Room[]> {
    return await this.roomsRepository.find({
      where: { type: category, available: 1 },
      relations: ['hotel', 'amenities'],
    });
  }
}
