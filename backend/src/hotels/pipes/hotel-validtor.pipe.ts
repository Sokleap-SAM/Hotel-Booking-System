import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class HotelValidatorPipe implements PipeTransform {
  transform(value: any) {
    if (!value || typeof value !== 'object') return value;

    this.validateAtLeastOneAmenity(value);

    if (value.googleMapUrl) {
      this.validateGoogleMapDomain(value.googleMapUrl);
    }

    if (value.location) {
      this.validateLocation(value.location);
    }

    if(value.phoneNumber){
      value.phoneNumber = this.validatePhoneNumber(value.phoneNumber);
      this.formatCambodianPhoneNumber(value.phoneNumber);
    }

    return value;
  }

  private validateAtLeastOneAmenity(value: any): void {
    const hasStandard =
      Array.isArray(value.amenityIds) && value.amenityIds.length > 0;
    const hasCustom = value.custom_amenities?.trim().length > 0;

    if (!hasStandard && !hasCustom) {
      throw new BadRequestException(
        'You must either select a Standard Amenity or enter a Custom one.',
      );
    }
  }

  private validatePhoneNumber(phone: string): void {
    const cleanedPhone = phone.replace(/\s+/g, '');
    const phoneRegex = /^[0-9]{9,10}$/;

    if (!phoneRegex.test(cleanedPhone)) {
      throw new BadRequestException(
        'Phone Number must be between 9 and 10 digits.',
      );
    }
  }

  private formatCambodianPhoneNumber(phone: string): string {
    if (phone.startsWith('0')) {
      return `+855${phone.substring(1)}`;
    }
    return phone;
  }

  private validateGoogleMapDomain(url: string): void {
    const isGoogle =
      url.includes('google.com') ||
      url.includes('goo.gl') ||
      url.includes('googleusercontent.com');
    if (!isGoogle) {
      throw new BadRequestException('Please provide a valid Google Maps link.');
    }
  }

  private validateLocation(location: string): void {
    const locationRegex = /^\d{1,3},\s?st\d{1,3},\s?khan\s[\w\s]+,\s?[\w\s]+$/i;
    if (!locationRegex.test(location)) {
      throw new BadRequestException(
        'Invalid Location Format. Expected: "100, st289, khan toulkok, Phnom Penh"',
      );
    }
  }
}
