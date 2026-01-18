import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class RoomValidatorPipe implements PipeTransform {
  transform(value: any) {
    if (!value || typeof value !== 'object') return value;

    this.validateAtLeastOneAmenity(value);

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
}
