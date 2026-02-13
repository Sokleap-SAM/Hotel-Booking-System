/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Hotel } from './entities/hotel.entity';
import { CreateHotelDto } from './dto/create_hotel.dto';
import { UpdateHotelDto } from './dto/update_hotel.dto';
import {
  Amenity,
  AmenityCategory,
} from 'src/amenities/entities/amenity.entity';
import { BookingItem } from '../booking/entities/booking-item.entity';
import { BookingStatus } from '../booking/entities/booking.entity';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { Destination } from './entities/hotel.entity';

@Injectable()
export class HotelsService {
  constructor(
    @InjectRepository(Hotel)
    private hotelsRepository: Repository<Hotel>,
    @InjectRepository(Amenity)
    private amenitiesRepository: Repository<Amenity>,
    @InjectRepository(BookingItem)
    private bookingItemRepository: Repository<BookingItem>,
  ) {}

  async create(dto: CreateHotelDto, files: any[]): Promise<Hotel> {
    const { amenityIds, ...hotelData } = dto;
    const filePaths = files.map((f) => `/uploads/hotels/${f.filename}`);

    const existingName = await this.hotelsRepository.findOne({
      where: { name: dto.name },
    });

    if (existingName) {
      throw new ConflictException(
        `Hotel with name "${dto.name}" already exists`,
      );
    }

    const existingEmail = await this.hotelsRepository.findOne({
      where: { email: dto.email },
    });

    if (existingEmail) {
      throw new ConflictException(
        `Hotel with email "${dto.email}" already exists`,
      );
    }

    const amenities = await this.amenitiesRepository.find({
      where: {
        id: In(amenityIds || []),
        category: AmenityCategory.HOTEL,
      },
    });

    // Set isActive to false if no amenities are assigned
    const isActive = amenities.length > 0;

    const hotel = this.hotelsRepository.create({
      ...hotelData,
      amenities,
      images: filePaths,
      isActive,
    });

    return await this.hotelsRepository.save(hotel);
  }

  async findAll(): Promise<Hotel[]> {
    return await this.hotelsRepository.find({
      where: { isActive: true },
      relations: ['rooms', 'amenities'],
      order: {
        name: 'ASC',
      },
    });
  }

  async findAllAdmin(): Promise<Hotel[]> {
    return await this.hotelsRepository.find({
      relations: ['rooms'],
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<Hotel> {
    const hotel = await this.hotelsRepository.findOne({
      where: { id, isActive: true },
      relations: ['amenities', 'rooms'],
    });

    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }

    return hotel;
  }

  async findOneAdmin(id: string): Promise<Hotel> {
    const hotel = await this.hotelsRepository.findOne({
      where: { id },
      relations: ['amenities', 'rooms'],
    });

    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }

    return hotel;
  }

  async update(
    id: string,
    dto: UpdateHotelDto,
    newFiles: any[],
  ): Promise<Hotel> {
    const hotel = await this.findOneAdmin(id);
    if (!hotel) throw new NotFoundException(`Hotel with ${id} not found`);

    const { amenityIds, existingImages, ...rest } = dto;

    // Check for duplicate name (only if name is being changed)
    if (dto.name && dto.name !== hotel.name) {
      const existingName = await this.hotelsRepository.findOne({
        where: { name: dto.name },
      });
      if (existingName) {
        throw new ConflictException(
          `Hotel with name "${dto.name}" already exists`,
        );
      }
    }

    // Check for duplicate email (only if email is being changed)
    if (dto.email && dto.email !== hotel.email) {
      const existingEmail = await this.hotelsRepository.findOne({
        where: { email: dto.email },
      });
      if (existingEmail) {
        throw new ConflictException(
          `Hotel with email "${dto.email}" already exists`,
        );
      }
    }

    const newPaths = newFiles.map((f) => `/uploads/hotels/${f.filename}`);
    const currentExisting = (existingImages as string[]) || [];
    const totalImagesAfterUpdate = [
      ...((existingImages as string[]) || []),
      ...newPaths,
    ];

    if (totalImagesAfterUpdate.length === 0) {
      throw new BadRequestException('A hotel must have at least one image.');
    }

    const imagesToDelete = hotel.images.filter(
      (path) => !currentExisting.includes(path),
    );

    for (const path of imagesToDelete) {
      try {
        await unlink(join(process.cwd(), path));
      } catch (err) {
        console.error(`Failed to delete old image: ${path}`, err);
      }
    }

    hotel.images = totalImagesAfterUpdate;

    if (Array.isArray(amenityIds) && amenityIds.length > 0) {
      hotel.amenities = await this.amenitiesRepository.find({
        where: {
          id: In(amenityIds),
          category: AmenityCategory.HOTEL,
        },
      });
      // Set isActive based on amenities
      hotel.isActive = hotel.amenities.length > 0;
    } else if (Array.isArray(amenityIds) && amenityIds.length === 0) {
      // If amenityIds is explicitly empty, clear amenities and deactivate
      hotel.amenities = [];
      hotel.isActive = false;
    }

    Object.assign(hotel, rest);
    return await this.hotelsRepository.save(hotel);
  }

  async remove(id: string): Promise<{ message: string }> {
    const hotel = await this.hotelsRepository.findOne({
      where: { id },
      relations: ['rooms'],
    });

    if (!hotel) {
      throw new NotFoundException(`Hotel with id ${id} not found`);
    }

    if (hotel.rooms && hotel.rooms.length > 0) {
      throw new BadRequestException(
        `Cannot delete hotel "${hotel.name}" because it has ${hotel.rooms.length} room(s)`,
      );
    }

    if (hotel.images) {
      for (const imagePath of hotel.images) {
        try {
          const fullPath = join(process.cwd(), imagePath);
          await unlink(fullPath);
        } catch (err) {
          console.error(`Failed to delete image: ${imagePath}`, err);
        }
      }
    }
    await this.hotelsRepository.remove(hotel);
    return {
      message: `Hotel "${hotel.name}" deleted successfully`,
    };
  }

  async getAvailableHotelByLowestPrice(): Promise<Hotel[]> {
    const hotels = await this.hotelsRepository
      .createQueryBuilder('hotel')
      .leftJoinAndSelect('hotel.rooms', 'room')
      .leftJoinAndSelect('hotel.amenities', 'amenity')
      .where('hotel.isActive = :isActive', { isActive: true })
      .orderBy('room.price', 'ASC')
      .getMany();

    return hotels;
  }

  async getAvailableHotelByHighestPrice(): Promise<Hotel[]> {
    const hotels = await this.hotelsRepository
      .createQueryBuilder('hotel')
      .leftJoinAndSelect('hotel.rooms', 'room')
      .leftJoinAndSelect('hotel.amenities', 'amenity')
      .where('hotel.isActive = :isActive', { isActive: true })
      .orderBy('room.price', 'DESC')
      .getMany();

    return hotels;
  }

  async getAvailableHotelByHighestRating(): Promise<Hotel[]> {
    return await this.hotelsRepository.find({
      where: {
        isActive: true,
      },
      relations: ['rooms', 'amenities'],
      order: {
        avgRating: 'DESC',
      },
    });
  }

  async getAvailableHotelBySelectedAmenities(
    amenityIds: number[],
  ): Promise<Hotel[]> {
    if (!amenityIds || amenityIds.length === 0) {
      return await this.hotelsRepository.find({
        where: { isActive: true },
        relations: ['rooms', 'amenities'],
      });
    }

    const hotels = await this.hotelsRepository
      .createQueryBuilder('hotel')
      .leftJoinAndSelect('hotel.rooms', 'room')
      .leftJoinAndSelect('hotel.amenities', 'amenity')
      .where('hotel.isActive = :isActive', { isActive: true })
      .andWhere('amenity.id IN (:...amenityIds)', { amenityIds })
      .getMany();

    return hotels.filter((hotel) => {
      const hotelAmenityIds = hotel.amenities.map((a) => a.id);
      return amenityIds.every((id) => hotelAmenityIds.includes(id));
    });
  }

  async getAvailableHotelByBedType(bedTypeIds: number[]): Promise<Hotel[]> {
    if (!bedTypeIds || bedTypeIds.length === 0) {
      return await this.hotelsRepository.find({
        where: { isActive: true },
        relations: ['rooms', 'amenities'],
      });
    }

    const hotels = await this.hotelsRepository
      .createQueryBuilder('hotel')
      .leftJoinAndSelect('hotel.rooms', 'room')
      .leftJoinAndSelect('room.roomBeds', 'roomBed')
      .leftJoinAndSelect('roomBed.bedType', 'bedType')
      .leftJoinAndSelect('hotel.amenities', 'amenity')
      .where('hotel.isActive = :isActive', { isActive: true })
      .andWhere('roomBed.bedTypeId IN (:...bedTypeIds)', { bedTypeIds })
      .getMany();

    return hotels;
  }

  async getAvailableHotelByHighestDiscount(): Promise<Hotel[]> {
    const hotels = await this.hotelsRepository
      .createQueryBuilder('hotel')
      .leftJoinAndSelect('hotel.rooms', 'room')
      .leftJoinAndSelect('hotel.amenities', 'amenity')
      .where('hotel.isActive = :isActive', { isActive: true })
      .andWhere('room.discountPercentage > 0')
      .orderBy('room.discountPercentage', 'DESC')
      .getMany();

    return hotels;
  }

  async getAvailableHotelByCombinedFilters(
    amenityIds: number[],
    bedTypeIds: number[],
    sort?: string,
  ): Promise<Hotel[]> {
    let queryBuilder = this.hotelsRepository
      .createQueryBuilder('hotel')
      .leftJoinAndSelect('hotel.rooms', 'room')
      .leftJoinAndSelect('hotel.amenities', 'amenity')
      .leftJoinAndSelect('room.roomBeds', 'roomBed')
      .leftJoinAndSelect('roomBed.bedType', 'bedType')
      .where('hotel.isActive = :isActive', { isActive: true });

    // Apply bed type filter in query if provided
    if (bedTypeIds && bedTypeIds.length > 0) {
      queryBuilder = queryBuilder.andWhere(
        'roomBed.bedTypeId IN (:...bedTypeIds)',
        { bedTypeIds },
      );
    }

    // Apply sorting
    switch (sort) {
      case 'lowest-price':
        queryBuilder = queryBuilder.orderBy('room.price', 'ASC');
        break;
      case 'highest-price':
        queryBuilder = queryBuilder.orderBy('room.price', 'DESC');
        break;
      case 'highest-rating':
        queryBuilder = queryBuilder.orderBy('hotel.avgRating', 'DESC');
        break;
      case 'highest-discount':
        queryBuilder = queryBuilder
          .andWhere('room.discountPercentage > 0')
          .orderBy('room.discountPercentage', 'DESC');
        break;
    }

    let hotels = await queryBuilder.getMany();

    // Apply amenity filter in-memory (to ensure ALL amenities are present)
    if (amenityIds && amenityIds.length > 0) {
      hotels = hotels.filter((hotel) => {
        const hotelAmenityIds = hotel.amenities.map((a) => a.id);
        return amenityIds.every((id) => hotelAmenityIds.includes(id));
      });
    }

    return hotels;
  }

  /**
   * Search hotels with available rooms matching the criteria
   */
  async searchHotelsWithAvailability(
    location?: string,
    checkIn?: Date,
    checkOut?: Date,
    totalGuests?: number,
    roomsNeeded?: number,
    destination?: Destination,
  ): Promise<any[]> {
    // Build base query
    let queryBuilder = this.hotelsRepository
      .createQueryBuilder('hotel')
      .leftJoinAndSelect('hotel.rooms', 'room')
      .leftJoinAndSelect('hotel.amenities', 'amenity')
      .where('hotel.isActive = :isActive', { isActive: true });

    // Filter by destination if provided
    if (destination) {
      queryBuilder = queryBuilder.andWhere('hotel.destination = :destination', {
        destination,
      });
    }

    // Filter by location if provided
    if (location) {
      queryBuilder = queryBuilder.andWhere(
        'LOWER(hotel.location) LIKE LOWER(:location)',
        { location: `%${location}%` },
      );
    }

    const hotels = await queryBuilder.getMany();

    // If no dates provided, return all matching hotels
    if (!checkIn || !checkOut) {
      return hotels;
    }

    // Calculate availability for each hotel
    const hotelsWithAvailability = await Promise.all(
      hotels.map(async (hotel) => {
        const roomsAvailability = await Promise.all(
          hotel.rooms.map(async (room) => {
            const bookedCount = await this.getBookedRoomCount(
              room.id,
              checkIn,
              checkOut,
            );
            const availableCount = Math.max(0, room.available - bookedCount);

            return {
              ...room,
              totalRooms: room.available,
              bookedRooms: bookedCount,
              availableRooms: availableCount,
            };
          }),
        );

        // Filter rooms by occupancy if totalGuests is provided
        const guestsPerRoom =
          roomsNeeded && roomsNeeded > 0
            ? Math.ceil((totalGuests || 1) / roomsNeeded)
            : totalGuests || 1;

        const suitableRooms = roomsAvailability.filter(
          (room) =>
            room.availableRooms > 0 && room.maxOccupancy >= guestsPerRoom,
        );

        // Calculate total available rooms
        const totalAvailableRooms = suitableRooms.reduce(
          (sum, room) => sum + room.availableRooms,
          0,
        );

        return {
          ...hotel,
          rooms: roomsAvailability,
          suitableRooms,
          totalAvailableRooms,
          hasAvailability: roomsNeeded
            ? totalAvailableRooms >= roomsNeeded
            : totalAvailableRooms > 0,
        };
      }),
    );

    // Filter hotels that have available rooms matching criteria
    return hotelsWithAvailability.filter((hotel) => hotel.hasAvailability);
  }

  async updateStatus(id: string, isActive: boolean): Promise<Hotel> {
    const hotel = await this.findOneAdmin(id);
    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }

    hotel.isActive = isActive;
    return await this.hotelsRepository.save(hotel);
  }

  /**
   * Get the number of rooms booked for a specific room during a date range
   */
  private async getBookedRoomCount(
    roomId: string,
    checkIn: Date,
    checkOut: Date,
  ): Promise<number> {
    const overlappingBookings = await this.bookingItemRepository
      .createQueryBuilder('bookingItem')
      .innerJoin('bookingItem.booking', 'booking')
      .where('bookingItem.roomId = :roomId', { roomId })
      .andWhere('booking.status IN (:...statuses)', {
        statuses: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
      })
      .andWhere('bookingItem.checkIn < :checkOut', { checkOut })
      .andWhere('bookingItem.checkOut > :checkIn', { checkIn })
      .getCount();

    return overlappingBookings;
  }
}
