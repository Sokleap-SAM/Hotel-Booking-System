import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { CreateHotelDto } from './dto/create_hotel.dto';
import { UpdateHotelDto } from './dto/update_hotel.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { hotelUploadConfig } from '../config/file-upload.config';

@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 10, hotelUploadConfig))
  create(
    @Body() dto: CreateHotelDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one hotel image is required');
    }
    return this.hotelsService.create(dto, files);
  }

  @Get()
  findAll() {
    return this.hotelsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hotelsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images', 10, hotelUploadConfig))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateHotelDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.hotelsService.update(id, dto, files || []);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hotelsService.remove(id);
  }
}
