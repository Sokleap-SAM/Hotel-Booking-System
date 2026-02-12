/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class RoomPriceValidationPipe implements PipeTransform {
  transform(value: any) {
    if (!value || typeof value !== 'object') return value;

    if (value.price !== undefined && value.discountPercentage !== undefined) {
      const discountedPrice =
        value.price * (1 - value.discountPercentage / 100);
      if (discountedPrice < 10) {
        throw new BadRequestException(
          `Price after discount must be at least $10.`,
        );
      }
    }

    return value;
  }
}
