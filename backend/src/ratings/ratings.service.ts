/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './entities/rating.entity';
import { Hotel } from 'src/hotels/entities/hotel.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
    @InjectRepository(Hotel)
    private readonly hotelRepository: Repository<Hotel>,
  ) {}

  private calculateOverallScore(
    dto: CreateRatingDto | UpdateRatingDto,
  ): number {
    const staff = dto.staff ?? 0;
    const facilities = dto.facilities ?? 0;
    const comfort = dto.comfort ?? 0;
    const value = dto.value ?? 0;
    const location = dto.location ?? 0;
    const wifi = dto.wifi ?? 0;
    const avgCategoryScore =
      (staff + facilities + comfort + value + location + wifi) / 6;
    // Convert 1-10 scale to 1-5 scale
    return Math.round((avgCategoryScore / 2) * 10) / 10;
  }

  async create(
    createRatingDto: CreateRatingDto,
    userId: number,
  ): Promise<Rating> {
    const hotel = await this.hotelRepository.findOne({
      where: { id: createRatingDto.hotelId },
    });

    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    // Check if user already rated this hotel
    const existingRating = await this.ratingRepository.findOne({
      where: { hotelId: createRatingDto.hotelId, userId },
    });

    if (existingRating) {
      throw new BadRequestException('You have already rated this hotel');
    }

    const overallScore = this.calculateOverallScore(createRatingDto);

    const rating = this.ratingRepository.create({
      ...createRatingDto,
      userId,
      overallScore,
    });

    const savedRating = await this.ratingRepository.save(rating);

    // Update hotel average rating
    await this.updateHotelRating(createRatingDto.hotelId);

    return savedRating;
  }

  async findAllByHotel(hotelId: string): Promise<{
    ratings: Rating[];
    summary: {
      avgRating: number;
      totalRatings: number;
      categoryAverages: {
        staff: number;
        facilities: number;
        comfort: number;
        value: number;
        location: number;
        wifi: number;
      };
    };
  }> {
    const ratings = await this.ratingRepository.find({
      where: { hotelId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    const totalRatings = ratings.length;

    if (totalRatings === 0) {
      return {
        ratings: [],
        summary: {
          avgRating: 0,
          totalRatings: 0,
          categoryAverages: {
            staff: 0,
            facilities: 0,
            comfort: 0,
            value: 0,
            location: 0,
            wifi: 0,
          },
        },
      };
    }

    const categoryAverages = {
      staff: 0,
      facilities: 0,
      comfort: 0,
      value: 0,
      location: 0,
      wifi: 0,
    };

    let totalOverall = 0;

    ratings.forEach((rating) => {
      categoryAverages.staff += Number(rating.staff);
      categoryAverages.facilities += Number(rating.facilities);
      categoryAverages.comfort += Number(rating.comfort);
      categoryAverages.value += Number(rating.value);
      categoryAverages.location += Number(rating.location);
      categoryAverages.wifi += Number(rating.wifi);
      totalOverall += Number(rating.overallScore);
    });

    // Calculate averages
    categoryAverages.staff =
      Math.round((categoryAverages.staff / totalRatings) * 10) / 10;
    categoryAverages.facilities =
      Math.round((categoryAverages.facilities / totalRatings) * 10) / 10;
    categoryAverages.comfort =
      Math.round((categoryAverages.comfort / totalRatings) * 10) / 10;
    categoryAverages.value =
      Math.round((categoryAverages.value / totalRatings) * 10) / 10;
    categoryAverages.location =
      Math.round((categoryAverages.location / totalRatings) * 10) / 10;
    categoryAverages.wifi =
      Math.round((categoryAverages.wifi / totalRatings) * 10) / 10;

    const avgRating = Math.round((totalOverall / totalRatings) * 10) / 10;

    return {
      ratings,
      summary: {
        avgRating,
        totalRatings,
        categoryAverages,
      },
    };
  }

  async findOne(id: string): Promise<Rating> {
    const rating = await this.ratingRepository.findOne({
      where: { id },
      relations: ['user', 'hotel'],
    });

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    return rating;
  }

  async findByUser(userId: number): Promise<Rating[]> {
    return this.ratingRepository.find({
      where: { userId },
      relations: ['hotel'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    updateRatingDto: UpdateRatingDto,
    userId: number,
  ): Promise<Rating> {
    const rating = await this.ratingRepository.findOne({
      where: { id, userId },
    });

    if (!rating) {
      throw new NotFoundException('Rating not found or not authorized');
    }

    // Merge updates
    const updatedData = {
      ...rating,
      ...updateRatingDto,
    };

    // Recalculate overall score if category ratings changed
    if (
      updateRatingDto.staff !== undefined ||
      updateRatingDto.facilities !== undefined ||
      updateRatingDto.comfort !== undefined ||
      updateRatingDto.value !== undefined ||
      updateRatingDto.location !== undefined ||
      updateRatingDto.wifi !== undefined
    ) {
      updatedData.overallScore = this.calculateOverallScore({
        staff: updatedData.staff,
        facilities: updatedData.facilities,
        comfort: updatedData.comfort,
        value: updatedData.value,
        location: updatedData.location,
        wifi: updatedData.wifi,
        hotelId: rating.hotelId,
      });
    }

    await this.ratingRepository.update(id, updatedData);

    // Update hotel average rating
    await this.updateHotelRating(rating.hotelId);

    return this.findOne(id);
  }

  async remove(id: string, userId: number): Promise<void> {
    const rating = await this.ratingRepository.findOne({
      where: { id, userId },
    });

    if (!rating) {
      throw new NotFoundException('Rating not found or not authorized');
    }

    const hotelId = rating.hotelId;
    await this.ratingRepository.delete(id);

    // Update hotel average rating
    await this.updateHotelRating(hotelId);
  }

  async removeByAdmin(id: string): Promise<void> {
    const rating = await this.ratingRepository.findOne({
      where: { id },
    });

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    const hotelId = rating.hotelId;
    await this.ratingRepository.delete(id);

    // Update hotel average rating
    await this.updateHotelRating(hotelId);
  }

  private async updateHotelRating(hotelId: string): Promise<void> {
    const result = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.overallScore)', 'avgRating')
      .addSelect('COUNT(rating.id)', 'totalRating')
      .where('rating.hotelId = :hotelId', { hotelId })
      .getRawOne();

    await this.hotelRepository.update(hotelId, {
      avgRating: result.avgRating ? parseFloat(result.avgRating) : 0,
      totalRating: parseInt(result.totalRating) || 0,
    });
  }

  async getUserRatingForHotel(
    hotelId: string,
    userId: number,
  ): Promise<Rating | null> {
    return this.ratingRepository.findOne({
      where: { hotelId, userId },
    });
  }
}
