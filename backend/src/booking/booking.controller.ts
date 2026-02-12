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
import { User } from '../auth/user/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.dectorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Roles('admin')
  @Get('admin/all')
  findAllAdmin() {
    return this.bookingService.findAllAdmin();
  }

  @Roles('admin')
  @Patch('admin/:id/approve')
  approve(@Param('id') id: string) {
    return this.bookingService.approve(id);
  }

  @Roles('admin')
  @Patch('admin/:id/reject')
  reject(@Param('id') id: string, @Body('reason') reason: string) {
    return this.bookingService.reject(id, reason || 'No reason provided');
  }

  @Roles('admin', 'user')
  @Post('calculate-price')
  calculatePrice(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.calculatePrice(createBookingDto);
  }

  @Roles('admin', 'user')
  @Post()
  create(
    @Request() req: { user: User },
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.bookingService.create(String(req.user.id), createBookingDto);
  }

  @Roles('admin', 'user')
  @Get()
  findAll(@Request() req: { user: User }) {
    return this.bookingService.findAllByUser(String(req.user.id));
  }

  @Roles('admin', 'user')
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: User }) {
    return this.bookingService.findOne(id, String(req.user.id));
  }

  @Roles('admin', 'user')
  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Request() req: { user: User }) {
    return this.bookingService.cancel(id, String(req.user.id));
  }
}
