/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  Amenity,
  AmenityCategory,
} from 'src/amenities/entities/amenity.entity';

@Injectable()
export class HotelValidatorPipe implements PipeTransform {
  constructor(
    @InjectRepository(Amenity)
    private amenityRepository: Repository<Amenity>,
  ) {}

  async transform(value: any) {
    if (!value || typeof value !== 'object') return value;

    if (
      value.amenityIds &&
      Array.isArray(value.amenityIds) &&
      value.amenityIds.length > 0
    ) {
      await this.validateAmenityIdsExist(value.amenityIds);
    }

    if (value.googleMapUrl) {
      this.validateGoogleMapDomain(value.googleMapUrl);
    }

    if (value.location) {
      this.validateLocation(value.location);
    }

    if (value.phoneNumber) {
      this.validatePhoneNumber(value.phoneNumber);
      value.phoneNumber = this.formatCambodianPhoneNumber(value.phoneNumber);
    }

    return value;
  }

  private validatePhoneNumber(phone: string): void {
    const cleanedPhone = phone.replace(/\s+/g, '');

    const internationalRegex = /^\+855[0-9]{8,9}$/;
    const localRegex = /^[0-9]{9,10}$/;

    if (
      !internationalRegex.test(cleanedPhone) &&
      !localRegex.test(cleanedPhone)
    ) {
      throw new BadRequestException(
        'Phone Number must be 9-10 digits or in +855 format with 8-9 digits.',
      );
    }
  }

  private formatCambodianPhoneNumber(phone: string): string {
    const cleanedPhone = phone.replace(/\s+/g, '');

    if (cleanedPhone.startsWith('+855')) {
      return cleanedPhone;
    }

    if (cleanedPhone.startsWith('0')) {
      return `+855${cleanedPhone.substring(1)}`;
    }
    return cleanedPhone;
  }

  private validateGoogleMapDomain(url: string): void {
    // Only accept Google Maps embed URLs for accurate map display
    const isEmbedUrl =
      url.includes('google.com/maps/embed') || url.includes('output=embed');

    if (!isEmbedUrl) {
      throw new BadRequestException(
        'Please provide a Google Maps embed URL. Go to Google Maps → Share → Embed a map → Copy the src URL from the iframe code.',
      );
    }
  }

  private validateLocation(location: string): void {
    const locationRegex = /^\d{1,3},\s?st[\w\s]+,\s?[\w\s]+,\s?[\w\s]+$/i;
    if (!locationRegex.test(location)) {
      throw new BadRequestException(
        'Invalid Location Format. Expected: "100, st289, khan toulkok, Phnom Penh"',
      );
    }
  }

  private async validateAmenityIdsExist(amenityIds: number[]): Promise<void> {
    const validAmenities = await this.amenityRepository.find({
      where: {
        id: In(amenityIds),
        category: AmenityCategory.HOTEL,
      },
    });

    const validIds = validAmenities.map((a) => a.id);
    const invalidIds = amenityIds.filter((id) => !validIds.includes(id));

    if (invalidIds.length > 0) {
      throw new BadRequestException(
        `Invalid amenity IDs: ${invalidIds.join(', ')}. Please select valid hotel amenities.`,
      );
    }
  }
}
