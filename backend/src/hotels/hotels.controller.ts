import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  UseGuards,
} from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { CreateHotelDto } from './dto/create_hotel.dto';
import { UpdateHotelDto } from './dto/update_hotel.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { hotelUploadConfig } from '../config/file-upload.config';
import { HotelValidatorPipe } from './pipes/hotel-validtor.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.dectorator';
import { Public } from '../auth/decorator/public.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hotels')
export class HotelsController {
  constructor(
    private readonly hotelsService: HotelsService,
    private readonly hotelValidatorPipe: HotelValidatorPipe,
  ) {}

  @Roles('admin')
  @Post()
  @UseInterceptors(FilesInterceptor('images', 10, hotelUploadConfig))
  create(
    @Body(HotelValidatorPipe) dto: CreateHotelDto,
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: false,
      }),
    )
    files: Express.Multer.File[],
  ) {
    return this.hotelsService.create(dto, files);
  }

  @Public()
  @Get()
  findAll() {
    return this.hotelsService.findAll();
  }

  @Roles('admin', 'user')
  @Get('filter/lowest-price')
  findAvailableHotelsByLowestPrice() {
    return this.hotelsService.getAvailableHotelByLowestPrice();
  }

  @Roles('admin', 'user')
  @Get('filter/highest-price')
  findAvailableHotelsByHighestPrice() {
    return this.hotelsService.getAvailableHotelByHighestPrice();
  }

  @Roles('admin', 'user')
  @Get('filter/highest-rating')
  findAvailableHotelsByHighestRating() {
    return this.hotelsService.getAvailableHotelByHighestRating();
  }

  @Roles('admin', 'user')
  @Get('filter/highest-discount')
  findAvailableHotelsByHighestDiscount() {
    return this.hotelsService.getAvailableHotelByHighestDiscount();
  }

  @Roles('admin', 'user')
  @Get('filter/by-amenities')
  findAvailableHotelsBySelectedAmenities(
    @Query('amenityIds') amenityIds: string,
  ) {
    const ids = amenityIds
      ? amenityIds
          .split(',')
          .map((id) => parseInt(id, 10))
          .filter((id) => !isNaN(id))
      : [];
    return this.hotelsService.getAvailableHotelBySelectedAmenities(ids);
  }

  @Roles('admin', 'user')
  @Get('filter/by-bed-type')
  findAvailableHotelsByBedType(@Query('bedTypeIds') bedTypeIds: string) {
    const ids = bedTypeIds
      ? bedTypeIds
          .split(',')
          .map((id) => parseInt(id, 10))
          .filter((id) => !isNaN(id))
      : [];
    return this.hotelsService.getAvailableHotelByBedType(ids);
  }

  @Roles('admin', 'user')
  @Get('search/availability')
  searchHotelsWithAvailability(
    @Query('location') location?: string,
    @Query('checkIn') checkIn?: string,
    @Query('checkOut') checkOut?: string,
    @Query('guests') guests?: string,
    @Query('rooms') rooms?: string,
  ) {
    const checkInDate = checkIn ? new Date(checkIn) : undefined;
    const checkOutDate = checkOut ? new Date(checkOut) : undefined;
    const totalGuests = guests ? parseInt(guests, 10) : undefined;
    const roomsNeeded = rooms ? parseInt(rooms, 10) : undefined;

    return this.hotelsService.searchHotelsWithAvailability(
      location,
      checkInDate,
      checkOutDate,
      totalGuests,
      roomsNeeded,
    );
  }

  @Roles('admin', 'user')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hotelsService.findOne(id);
  }

  @Roles('admin')
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images', 10, hotelUploadConfig))
  update(
    @Param('id') id: string,
    @Body(HotelValidatorPipe) dto: UpdateHotelDto,
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: false,
      }),
    )
    files?: Express.Multer.File[],
  ) {
    return this.hotelsService.update(id, dto, files || []);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hotelsService.remove(id);
  }
}
