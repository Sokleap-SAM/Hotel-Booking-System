import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { RoomBed } from './entities/room-bed.entity';
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
    @InjectRepository(RoomBed)
    private roomBedRepository: Repository<RoomBed>,
    @InjectRepository(Hotel)
    private hotelsRepository: Repository<Hotel>,
    @InjectRepository(Amenity)
    private readonly amenitiesRepository: Repository<Amenity>,
  ) {}

  async create(createRoomDto: CreateRoomDto, files: any[]): Promise<Room> {
    const { hotelId, amenityIds, roomBeds, ...roomData } =
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
      images: filePaths,
    });

    const savedRoom = await this.roomsRepository.save(room);

    // Create room beds if provided
    if (roomBeds && roomBeds.length > 0) {
      const roomBedEntities = roomBeds.map((bed) =>
        this.roomBedRepository.create({
          roomId: savedRoom.id,
          bedTypeId: bed.bedTypeId,
          quantity: bed.quantity,
        }),
      );
      await this.roomBedRepository.save(roomBedEntities);
    }

    return await this.findOne(savedRoom.id);
  }

  async findOne(id: string): Promise<Room> {
    const room = await this.roomsRepository.findOne({
      where: { id },
      relations: ['hotel', 'amenities', 'roomBeds', 'roomBeds.bedType'],
    });

    if (!room) {
      throw new NotFoundException(`Room ${id} not found`);
    }

    return room;
  }

  async findByHotel(hotelId: string): Promise<any[]> {
    const rooms = await this.roomsRepository.find({
      where: { hotelId },
      relations: ['hotel', 'amenities', 'roomBeds', 'roomBeds.bedType'],
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
      relations: ['amenities', 'roomBeds'],
    });

    if (!room) throw new NotFoundException(`Room ${id} not found`);

    const { amenityIds, existingImages, roomBeds, ...rest } =
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

    if (Array.isArray(amenityIds) && amenityIds.length > 0) {
      room.amenities = await this.amenitiesRepository.find({
        where: {
          id: In(amenityIds),
          category: AmenityCategory.ROOM,
        },
      });
    }

    // Update room beds if provided
    if (roomBeds !== undefined) {
      // Remove existing room beds
      await this.roomBedRepository.delete({ roomId: id });

      // Create new room beds
      if (roomBeds && roomBeds.length > 0) {
        const roomBedEntities = roomBeds.map((bed) =>
          this.roomBedRepository.create({
            roomId: id,
            bedTypeId: bed.bedTypeId,
            quantity: bed.quantity,
          }),
        );
        await this.roomBedRepository.save(roomBedEntities);
      }
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
}
