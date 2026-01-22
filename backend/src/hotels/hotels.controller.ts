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
} from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { CreateHotelDto } from './dto/create_hotel.dto';
import { UpdateHotelDto } from './dto/update_hotel.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { hotelUploadConfig } from '../config/file-upload.config';
import { HotelValidatorPipe } from './pipes/hotel-validtor.pipe';

@Controller('hotels')
export class HotelsController {
  constructor(
    private readonly hotelsService: HotelsService,
    private readonly hotelValidatorPipe: HotelValidatorPipe,
  ) {}

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

  @Get()
  findAll() {
    return this.hotelsService.findAll();
  }

  @Get('filter/lowest-price')
  findAvailableHotelsByLowestPrice() {
    return this.hotelsService.getAvailableHotelByLowestPrice();
  }

  @Get('filter/highest-price')
  findAvailableHotelsByHighestPrice() {
    return this.hotelsService.getAvailableHotelByHighestPrice();
  }

  @Get('filter/highest-rating')
  findAvailableHotelsByHighestRating() {
    return this.hotelsService.getAvailableHotelByHighestRating();
  }

  @Get('filter/highest-discount')
  findAvailableHotelsByHighestDiscount() {
    return this.hotelsService.getAvailableHotelByHighestDiscount();
  }

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hotelsService.findOne(id);
  }

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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hotelsService.remove(id);
  }
}
