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
  constructor(private readonly hotelsService: HotelsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 10, hotelUploadConfig))
  create(
    @Body(new HotelValidatorPipe()) dto: CreateHotelDto,
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hotelsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images', 10, hotelUploadConfig))
  update(
    @Param('id') id: string,
    @Body(new HotelValidatorPipe()) dto: UpdateHotelDto,
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
