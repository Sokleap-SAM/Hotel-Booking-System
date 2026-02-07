/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { User } from '../auth/user/entity/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  // Admin routes (no auth required)
  @Get('admin/all')
  findAllAdmin() {
    return this.bookingService.findAllAdmin();
  }

  @Patch('admin/:id/approve')
  approve(@Param('id') id: string) {
    return this.bookingService.approve(id);
  }

  @Patch('admin/:id/reject')
  reject(@Param('id') id: string, @Body('reason') reason: string) {
    return this.bookingService.reject(id, reason || 'No reason provided');
  }

  // Price calculation (no auth required)
  @Post('calculate-price')
  calculatePrice(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.calculatePrice(createBookingDto);
  }

  // User routes (require JWT authentication)
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Request() req: { user: User },
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.bookingService.create(String(req.user.id), createBookingDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req: { user: User }) {
    return this.bookingService.findAllByUser(String(req.user.id));
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: User }) {
    return this.bookingService.findOne(id, String(req.user.id));
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Request() req: { user: User }) {
    return this.bookingService.cancel(id, String(req.user.id));
  }
}
