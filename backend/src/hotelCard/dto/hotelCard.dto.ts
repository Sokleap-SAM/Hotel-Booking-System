export class CreateHotelCardDto {
  location: string;
  rating: number;
  price: number;
  image_url: string;
  discount?: number; // Optional
}
