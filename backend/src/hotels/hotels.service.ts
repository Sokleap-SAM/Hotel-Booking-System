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

  async create(dto: CreateHotelDto, files: any[]): Promise<Hotel> {
    const { amenityIds, custom_amenities, ...hotelData } = dto;
    const filePaths = files.map((f) => `/uploads/hotels/${f.filename}`);

    const amenities = await this.amenitiesRepository.find({
      where: {
        id: In(amenityIds || []),
        category: AmenityCategory.HOTEL,
      },
    });

    const hotel = this.hotelsRepository.create({
      ...hotelData,
      amenities,
      custom_amenities: custom_amenities || '',
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
    newFiles: any[],
  ): Promise<Hotel> {
    const hotel = await this.findOne(id);
    const { amenityIds, existingImages, custom_amenities, ...rest } = dto;

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

    if (custom_amenities && (!amenityIds || amenityIds.length === 0)) {
      hotel.amenities = [];
    } else if (Array.isArray(amenityIds) && amenityIds.length > 0) {
      hotel.amenities = await this.amenitiesRepository.find({
        where: {
          id: In(amenityIds),
          category: AmenityCategory.HOTEL,
        },
      });
    }

    if (custom_amenities !== undefined) {
      hotel.custom_amenities = custom_amenities?.trim() || '';
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
