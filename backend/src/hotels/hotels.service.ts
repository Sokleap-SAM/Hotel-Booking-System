/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
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
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class HotelsService {
  constructor(
    @InjectRepository(Hotel)
    private hotelsRepository: Repository<Hotel>,
    @InjectRepository(Amenity)
    private amenitiesRepository: Repository<Amenity>,
  ) {}

  private parseField(field: any) {
    if (!field || field === 'undefined' || field === 'null') return [];
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch (e) {
        return [];
      }
    }
    return field;
  }

  async create(
    dto: CreateHotelDto,
    files: Express.Multer.File[],
  ): Promise<Hotel> {
    const { amenityIds, custom_amenities, ...hotelData } = dto;
    const parsedIds = this.parseField(amenityIds);
    const hasAmenities = Array.isArray(parsedIds) && parsedIds.length > 0;
    const hasCustomAmenities =
      dto.custom_amenities && dto.custom_amenities.trim() !== '';

    if (!hasAmenities && !hasCustomAmenities) {
      throw new BadRequestException(
        'Please select amenities or enter custom amenities',
      );
    }
    const filePaths = files.map((f) => `/uploads/hotels/${f.filename}`);
    let amenities: Amenity[] = [];
    if (hasAmenities) {
      amenities = await this.amenitiesRepository.find({
        where: {
          id: In(parsedIds),
          category: AmenityCategory.HOTEL,
        },
      });
    }

    const hotel = this.hotelsRepository.create({
      ...hotelData,
      amenities,
      custom_amenities: hasCustomAmenities ? (custom_amenities as any) : null,
      images: filePaths,
    });

    return await this.hotelsRepository.save(hotel);
  }

  async findAll(): Promise<Hotel[]> {
    return await this.hotelsRepository.find({
      relations: ['rooms'],
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<Hotel> {
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
    newFiles: Express.Multer.File[],
  ): Promise<Hotel> {
    const hotel = await this.findOne(id);
    const { amenityIds, existingImages, custom_amenities, ...rest } = dto;

    const incomingIds =
      amenityIds !== undefined
        ? this.parseField(amenityIds)
        : hotel.amenities.map((a) => a.id);
    const incomingCustom =
      custom_amenities !== undefined
        ? custom_amenities
        : hotel.custom_amenities;

    const hasAmenities = Array.isArray(incomingIds) && incomingIds.length > 0;
    const hasCustomAmenities = incomingCustom && incomingCustom.trim() !== '';

    if (!hasAmenities && !hasCustomAmenities) {
      throw new BadRequestException(
        'Please select amenities or enter custom amenities',
      );
    }

    const oldImages = this.parseField(existingImages);
    const newPaths = newFiles.map((f) => `/uploads/hotels/${f.filename}`);
    hotel.images = [...oldImages, ...newPaths];

    if (amenityIds !== undefined) {
      const ids = this.parseField(amenityIds);
      hotel.amenities = await this.amenitiesRepository.find({
        where: {
          id: In(Array.isArray(ids) ? ids : []),
          category: AmenityCategory.HOTEL,
        },
      });
    }

    if (custom_amenities !== undefined) {
      if (custom_amenities && custom_amenities.trim()) {
        hotel.custom_amenities = custom_amenities.trim();
      } else {
        (hotel.custom_amenities as any) = null;
      }
    }

    Object.assign(hotel, rest);
    return await this.hotelsRepository.save(hotel);
  }

  async remove(id: string): Promise<{ message: string }> {
    const hotel = await this.findOne(id);
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
      message: `Hotel ${id} deleted successfully`,
    };
  }
}
