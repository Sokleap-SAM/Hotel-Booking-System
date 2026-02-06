import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { HotelCardService } from './hotelCard.service';
import { CreateHotelCardDto } from './dto/hotelCard.dto';
import type { Hotel } from './interfaces/hotelCard.interface'; // Import it here too

@Controller('homepage/popularHotel')
export class HotelCardController {
  constructor(private readonly hotelCardService: HotelCardService) {}

  @Post()
  create(@Body() createDto: CreateHotelCardDto): Hotel {
    return this.hotelCardService.create(createDto);
  }

  @Delete(':id') // This makes the URL: http://localhost:3000/homepage/popularHotel/123
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.hotelCardService.remove(id);
  }

  @Get()
  findAll(): Hotel[] {
    return this.hotelCardService.findAll();
  }
}
