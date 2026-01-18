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
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create_room.dto';
import { UpdateRoomDto } from './dto/update_room.dto';
import { RoomValidatorPipe } from './pipes/room-validator.pipe';
import { FilesInterceptor } from '@nestjs/platform-express';
import { roomUploadConfig } from 'src/config/file-upload.config';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 10, roomUploadConfig))
  create(
    @Body(new RoomValidatorPipe()) dto: CreateRoomDto,
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: false,
      }),
    )
    files: Express.Multer.File[],
  ) {
    return this.roomsService.create(dto, files);
  }

  @Get('available')
  findAvailable() {
    return this.roomsService.findAvailable();
  }

  @Get('hotel/:hotelId')
  findByHotel(@Param('hotelId') hotelId: string) {
    return this.roomsService.findByHotel(hotelId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images', 10, roomUploadConfig))
  update(
    @Param('id') id: string,
    @Body(new RoomValidatorPipe()) dto: UpdateRoomDto,
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: false,
      }),
    )
    files?: Express.Multer.File[],
  ) {
    return this.roomsService.update(id, dto, files || []);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomsService.remove(id);
  }
}
