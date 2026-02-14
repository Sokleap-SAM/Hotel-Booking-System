/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, Raw } from 'typeorm';
import { Room } from './entities/room.entity';
import { RoomBed } from './entities/room-bed.entity';
import { Hotel } from '../hotels/entities/hotel.entity';
import { BookingItem } from '../booking/entities/booking-item.entity';
import { BookingStatus } from '../booking/entities/booking.entity';
import { CreateRoomDto } from './dto/create_room.dto';
import { UpdateRoomDto } from './dto/update_room.dto';
import {
  Amenity,
  AmenityCategory,
} from 'src/amenities/entities/amenity.entity';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { getFilePath } from '../config/file-upload.config';
import { deleteCloudinaryImage } from '../config/cloudinary.config';

const isProduction = process.env.NODE_ENV === 'production';

// Helper to delete image (local or Cloudinary)
async function deleteImage(imagePath: string): Promise<void> {
  if (isProduction && imagePath.startsWith('http')) {
    await deleteCloudinaryImage(imagePath);
  } else {
    await unlink(join(process.cwd(), imagePath));
  }
}

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
    @InjectRepository(BookingItem)
    private readonly bookingItemRepository: Repository<BookingItem>,
  ) {}

  async create(createRoomDto: CreateRoomDto, files: any[]): Promise<Room> {
    const existingRoom = await this.roomsRepository.findOne({
      where: {
        name: Raw((alias) => `LOWER(${alias}) = LOWER(:name)`, {
          name: createRoomDto.name,
        }),
        hotelId: createRoomDto.hotelId,
      },
    });
    if (existingRoom) {
      throw new ConflictException(
        `Room with name "${createRoomDto.name}" already exists in this hotel`,
      );
    }
    const { hotelId, amenityIds, roomBeds, ...roomData } = createRoomDto;
    const filePaths = files.map((f) => getFilePath(f, 'rooms'));

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
    // Use query builder to avoid eager loading of roomBeds
    const room = await this.roomsRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.amenities', 'amenities')
      .where('room.id = :id', { id })
      .getOne();

    if (!room) throw new NotFoundException(`Room ${id} not found`);

    const { amenityIds, existingImages, roomBeds, ...rest } = updateRoomDto;

    // Check for duplicate name within the same hotel (only if name is being changed)
    if (
      updateRoomDto.name &&
      updateRoomDto.name.toLowerCase() !== room.name.toLowerCase()
    ) {
      const existingRoom = await this.roomsRepository.findOne({
        where: {
          name: Raw((alias) => `LOWER(${alias}) = LOWER(:name)`, {
            name: updateRoomDto.name,
          }),
          hotelId: room.hotelId,
        },
      });
      if (existingRoom) {
        throw new ConflictException(
          `Room with name "${updateRoomDto.name}" already exists in this hotel`,
        );
      }
    }

    const newPaths = newFiles.map((f) => getFilePath(f, 'rooms'));
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
        await deleteImage(path);
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
    await this.roomsRepository.save(room);

    // Return fresh room with all relations
    return await this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const room = await this.findOne(id);

    // Check if room has any active booking items (not completed or checkout date not passed)
    const now = new Date();
    const activeBookings = await this.bookingItemRepository
      .createQueryBuilder('bookingItem')
      .innerJoin('bookingItem.booking', 'booking')
      .where('bookingItem.roomId = :roomId', { roomId: id })
      .andWhere(
        '(booking.status != :completed OR bookingItem.checkOut >= :now)',
        {
          completed: BookingStatus.COMPLETED,
          now: now.toISOString().split('T')[0],
        },
      )
      .getCount();

    if (activeBookings > 0) {
      throw new BadRequestException(
        `Cannot delete room '${room.name}' because it has ${activeBookings} active booking(s)`,
      );
    }

    if (room.images) {
      for (const imagePath of room.images) {
        try {
          await deleteImage(imagePath);
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

  async getBookedRoomCount(
    roomId: string,
    checkIn: Date,
    checkOut: Date,
  ): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count overlapping bookings that are:
    // 1. PENDING or CONFIRMED (active bookings), OR
    // 2. COMPLETED but checkout date hasn't passed yet (guest still in room)
    const overlappingBookings = await this.bookingItemRepository
      .createQueryBuilder('bookingItem')
      .innerJoin('bookingItem.booking', 'booking')
      .where('bookingItem.roomId = :roomId', { roomId })
      .andWhere(
        '(booking.status IN (:...activeStatuses) OR (booking.status = :completedStatus AND bookingItem.checkOut > :today))',
        {
          activeStatuses: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
          completedStatus: BookingStatus.COMPLETED,
          today: today.toISOString().split('T')[0],
        },
      )
      .andWhere('bookingItem.checkIn < :checkOut', { checkOut })
      .andWhere('bookingItem.checkOut > :checkIn', { checkIn })
      .getCount();

    return overlappingBookings;
  }

  async getAvailableRoomCount(
    roomId: string,
    checkIn: Date,
    checkOut: Date,
  ): Promise<number> {
    const room = await this.roomsRepository.findOne({ where: { id: roomId } });
    if (!room) return 0;

    const bookedCount = await this.getBookedRoomCount(
      roomId,
      checkIn,
      checkOut,
    );
    return Math.max(0, room.available - bookedCount);
  }

  async findByHotelWithAvailability(
    hotelId: string,
    checkIn: Date,
    checkOut: Date,
    minOccupancy?: number,
  ): Promise<any[]> {
    const rooms = await this.roomsRepository.find({
      where: { hotelId },
      relations: ['hotel', 'amenities', 'roomBeds', 'roomBeds.bedType'],
      order: { price: 'ASC' },
    });

    const roomsWithAvailability = await Promise.all(
      rooms.map(async (room) => {
        const bookedCount = await this.getBookedRoomCount(
          room.id,
          checkIn,
          checkOut,
        );
        const availableCount = Math.max(0, room.available - bookedCount);

        return {
          ...room,
          hotel: { name: room.hotel?.name },
          totalRooms: room.available,
          bookedRooms: bookedCount,
          availableRooms: availableCount,
        };
      }),
    );

    let filteredRooms = roomsWithAvailability;
    if (minOccupancy && minOccupancy > 0) {
      filteredRooms = filteredRooms.filter(
        (room) => room.maxOccupancy >= minOccupancy,
      );
    }

    return filteredRooms;
  }

  async hasAvailableRooms(
    hotelId: string,
    checkIn: Date,
    checkOut: Date,
    totalGuests: number,
    roomsNeeded: number,
  ): Promise<boolean> {
    const rooms = await this.findByHotelWithAvailability(
      hotelId,
      checkIn,
      checkOut,
    );

    const suitableRooms = rooms.filter(
      (room) =>
        room.availableRooms > 0 &&
        room.maxOccupancy >= Math.ceil(totalGuests / roomsNeeded),
    );

    const totalAvailable = suitableRooms.reduce(
      (sum, room) => sum + room.availableRooms,
      0,
    );

    return totalAvailable >= roomsNeeded;
  }
}
