import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { Hotel } from '../hotels/entities/hotel.entity';
import { CreateRoomDto } from './dto/create_room.dto';
import { UpdateRoomDto } from './dto/update_room.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
    @InjectRepository(Hotel)
    private hotelsRepository: Repository<Hotel>,
  ) {}

  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    const hotel = await this.hotelsRepository.findOne({
      where: { id: createRoomDto.hotelId },
    });

    if (!hotel) {
      throw new NotFoundException(
        `Hotel with ID ${createRoomDto.hotelId} not found`,
      );
    }

    const room = this.roomsRepository.create(createRoomDto);
    room.hotel = hotel;

    return await this.roomsRepository.save(room);
  }

  async findOne(id: number): Promise<Room> {
    const room = await this.roomsRepository.findOne({
      where: { id },
      relations: ['hotel'],
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    return room;
  }

  async findByHotel(hotelId: string): Promise<any[]> {
    const rooms = await this.roomsRepository.find({
      where: { hotelId },
      relations: ['hotel'],
      order: { price: 'ASC' },
    });

    return rooms.map((room) => ({
      id: room.id,
      name: room.name,
      shortDescription: room.shortDescription,
      longDescription: room.longDescription,
      type: room.type,
      available: room.available,
      price: room.price,
      maxOccupancy: room.maxOccupancy,
      discountPercentage: room.discountPercentage,
      images: room.images,
      amenities: room.amenities,
      otherAmenities: room.otherAmenities,
      createdAt: room.createdAt,
      hotel: {
        name: room.hotel?.name,
      },
    }));
  }

  async update(id: number, updateRoomDto: UpdateRoomDto): Promise<Room> {
    const room = await this.findOne(id);

    if (updateRoomDto.hotelId && updateRoomDto.hotelId !== room.hotelId) {
      const hotel = await this.hotelsRepository.findOne({
        where: { id: updateRoomDto.hotelId },
      });

      if (!hotel) {
        throw new NotFoundException(
          `Hotel with ID ${updateRoomDto.hotelId} not found`,
        );
      }

      room.hotel = hotel;
      room.hotelId = updateRoomDto.hotelId;
    }

    if (updateRoomDto.name !== undefined) {
      room.name = updateRoomDto.name;
    }
    if (updateRoomDto.shortDescription !== undefined) {
      room.shortDescription = updateRoomDto.shortDescription;
    }
    if (updateRoomDto.longDescription !== undefined) {
      room.longDescription = updateRoomDto.longDescription;
    }
    if (updateRoomDto.type !== undefined) {
      room.type = updateRoomDto.type;
    }
    if (updateRoomDto.available !== undefined) {
      room.available = updateRoomDto.available;
    }
    if (updateRoomDto.price !== undefined) {
      room.price = updateRoomDto.price;
    }
    if (updateRoomDto.maxOccupancy !== undefined) {
      room.maxOccupancy = updateRoomDto.maxOccupancy;
    }
    if (updateRoomDto.discountPercentage !== undefined) {
      room.discountPercentage = updateRoomDto.discountPercentage;
    }
    if (updateRoomDto.images !== undefined) {
      room.images = updateRoomDto.images;
    }
    if (updateRoomDto.amenities !== undefined) {
      room.amenities = updateRoomDto.amenities;
    }
    if (updateRoomDto.otherAmenities !== undefined) {
      room.otherAmenities = updateRoomDto.otherAmenities;
    }

    return await this.roomsRepository.save(room);
  }

  async remove(id: number): Promise<{ message: string }> {
    const room = await this.findOne(id);
    await this.roomsRepository.remove(room);

    return {
      message: `Room with ID ${id} deleted successfully`,
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
}
