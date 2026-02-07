import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { User } from '../auth/user/entity/user.entity';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Request() req: { user: User },
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.bookingService.create(String(req.user.id), createBookingDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@Request() req: { user: User }) {
    return this.bookingService.findAllByUser(String(req.user.id));
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: User }) {
    return this.bookingService.findOne(id, String(req.user.id));
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Request() req: { user: User }) {
    return this.bookingService.cancel(id, String(req.user.id));
  }

  @Post('calculate-price')
  calculatePrice(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.calculatePrice(createBookingDto);
  }
}
