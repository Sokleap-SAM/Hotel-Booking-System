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
  UsePipes,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create_room.dto';
import { UpdateRoomDto } from './dto/update_room.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { roomUploadConfig } from 'src/config/file-upload.config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.dectorator';
import { Public } from '../auth/decorator/public.decorator';
import { RoomPriceValidationPipe } from './pipe/room-price-validator.pipe';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Roles('admin')
  @Post()
  @UseInterceptors(FilesInterceptor('images', 10, roomUploadConfig))
  @UsePipes(RoomPriceValidationPipe)
  create(
    @Body() dto: CreateRoomDto,
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: false,
      }),
    )
    files: Express.Multer.File[],
  ) {
    return this.roomsService.create(dto, files);
  }

  @Public()
  @Get('available')
  findAvailable() {
    return this.roomsService.findAvailable();
  }

  @Public()
  @Get('hotel/:hotelId')
  findByHotel(@Param('hotelId') hotelId: string) {
    return this.roomsService.findByHotel(hotelId);
  }

  @Public()
  @Get('hotel/:hotelId/availability')
  findByHotelWithAvailability(
    @Param('hotelId') hotelId: string,
    @Query('checkIn') checkIn: string,
    @Query('checkOut') checkOut: string,
    @Query('guests') guests?: string,
  ) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const minOccupancy = guests ? parseInt(guests, 10) : undefined;
    return this.roomsService.findByHotelWithAvailability(
      hotelId,
      checkInDate,
      checkOutDate,
      minOccupancy,
    );
  }

  @Public()
  @Get(':id/availability')
  async getAvailability(
    @Param('id') id: string,
    @Query('checkIn') checkIn: string,
    @Query('checkOut') checkOut: string,
  ) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const availableCount = await this.roomsService.getAvailableRoomCount(
      id,
      checkInDate,
      checkOutDate,
    );
    return { roomId: id, availableCount };
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  @Roles('admin')
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images', 10, roomUploadConfig))
  @UsePipes(RoomPriceValidationPipe)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRoomDto,
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: false,
      }),
    )
    files?: Express.Multer.File[],
  ) {
    return this.roomsService.update(id, dto, files || []);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomsService.remove(id);
  }
}
