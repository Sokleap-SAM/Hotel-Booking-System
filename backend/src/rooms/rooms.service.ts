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
import { join } from 'path';
import { unlink } from 'fs/promises';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
    @InjectRepository(Hotel)
    private hotelsRepository: Repository<Hotel>,
    @InjectRepository(Amenity)
    private readonly amenitiesRepository: Repository<Amenity>,
  ) {}

  async create(createRoomDto: CreateRoomDto, files: any[]): Promise<Room> {
    const { hotelId, amenityIds, custom_amenities, ...roomData } =
      createRoomDto;
    const filePaths = files.map((f) => `/uploads/rooms/${f.filename}`);

    const amenities = await this.amenitiesRepository.find({
      where: {
        id: In(amenityIds || []),
        category: AmenityCategory.ROOM,
      },
    });

    const hotel = await this.hotelsRepository.findOneBy({ id: hotelId });
    if (!hotel) throw new NotFoundException(`Hotel ${hotelId} not found`);

    const room = this.roomsRepository.create({
      ...roomData,
      amenities,
      hotel,
      custom_amenities: custom_amenities || '',
      images: filePaths,
    });

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

  async update(
    id: string,
    updateRoomDto: UpdateRoomDto,
    newFiles: any[],
  ): Promise<Room> {
    const room = await this.roomsRepository.findOne({
      where: { id },
      relations: ['amenities'],
    });

    if (!room) throw new NotFoundException(`Room ${id} not found`);

    const { amenityIds, existingImages, custom_amenities, ...rest } =
      updateRoomDto;

    const newPaths = newFiles.map((f) => `/uploads/rooms/${f.filename}`);
    const currentExisting = (existingImages as string[]) || [];
    const totalImagesAfterUpdate = [
      ...((existingImages as string[]) || []),
      ...newPaths,
    ];

    if (totalImagesAfterUpdate.length === 0) {
      throw new BadRequestException('A room must have at least one image.');
    }

    const imagesToDelete = room.images.filter(
      (path) => !currentExisting.includes(path),
    );

    for (const path of imagesToDelete) {
      try {
        await unlink(join(process.cwd(), path));
      } catch (err) {
        console.error(`Failed to delete old image: ${path}`, err);
      }
    }

    room.images = totalImagesAfterUpdate;

    if (custom_amenities && (!amenityIds || amenityIds.length === 0)) {
      room.amenities = [];
    } else if (Array.isArray(amenityIds) && amenityIds.length > 0) {
      room.amenities = await this.amenitiesRepository.find({
        where: {
          id: In(amenityIds),
          category: AmenityCategory.ROOM,
        },
      });
    }

    if (custom_amenities !== undefined) {
      room.custom_amenities = custom_amenities?.trim() || '';
    }

    Object.assign(room, rest);
    return await this.roomsRepository.save(room);
  }

  async remove(id: string): Promise<{ message: string }> {
    const room = await this.findOne(id);
    if (room.images) {
      for (const imagePath of room.images) {
        try {
          const fullPath = join(process.cwd(), imagePath);
          await unlink(fullPath);
        } catch (err) {
          console.error(`Failed to delete image: ${imagePath}`, err);
        }
      }
    }
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

  async findDiscounted(minDiscount: number): Promise<Room[]> {
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
