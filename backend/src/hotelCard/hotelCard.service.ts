import { Injectable } from '@nestjs/common';
import { CreateHotelCardDto } from './dto/hotelCard.dto';
import { Hotel } from './interfaces/hotelCard.interface'; // Import it here

@Injectable()
export class HotelCardService {
  private hotels: Hotel[] = [];
  private idCounter = 1;

  create(dto: CreateHotelCardDto): Hotel {
    const newHotel: Hotel = {
      id: this.idCounter++, // Use short numbers like 1, 2, 3...
      ...dto,
    };
    this.hotels.push(newHotel);
    return newHotel;
  }

  // src/hotelCard/hotelCard.service.ts

  remove(id: number): boolean {
    const initialLength = this.hotels.length;
    // Filter out the hotel with the matching ID
    this.hotels = this.hotels.filter((hotel) => hotel.id !== id);
    // Return true if something was actually removed
    return this.hotels.length < initialLength;
  }

  findAll(): Hotel[] {
    return this.hotels;
  }
}
