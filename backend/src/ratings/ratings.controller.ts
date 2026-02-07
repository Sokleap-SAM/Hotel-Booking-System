/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createRatingDto: CreateRatingDto, @Request() req) {
    return this.ratingsService.create(createRatingDto, req.user.id);
  }

  @Get('hotel/:hotelId')
  findAllByHotel(@Param('hotelId') hotelId: string) {
    return this.ratingsService.findAllByHotel(hotelId);
  }

  @Get('hotel/:hotelId/user')
  @UseGuards(AuthGuard('jwt'))
  getUserRatingForHotel(@Param('hotelId') hotelId: string, @Request() req) {
    return this.ratingsService.getUserRatingForHotel(hotelId, req.user.id);
  }

  @Get('my-ratings')
  @UseGuards(AuthGuard('jwt'))
  findMyRatings(@Request() req) {
    return this.ratingsService.findByUser(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ratingsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id') id: string,
    @Body() updateRatingDto: UpdateRatingDto,
    @Request() req,
  ) {
    return this.ratingsService.update(id, updateRatingDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string, @Request() req) {
    return this.ratingsService.remove(id, req.user.id);
  }

  @Delete('admin/:id')
  @UseGuards(AuthGuard('jwt'))
  removeByAdmin(@Param('id') id: string) {
    return this.ratingsService.removeByAdmin(id);
  }
}
