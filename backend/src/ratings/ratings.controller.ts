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
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.dectorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Roles('admin', 'user')
  @Post()
  create(@Body() createRatingDto: CreateRatingDto, @Request() req) {
    return this.ratingsService.create(createRatingDto, req.user.id);
  }

  @Roles('admin', 'user')
  @Get('hotel/:hotelId')
  findAllByHotel(@Param('hotelId') hotelId: string) {
    return this.ratingsService.findAllByHotel(hotelId);
  }

  @Roles('admin', 'user')
  @Get('hotel/:hotelId/user')
  getUserRatingForHotel(@Param('hotelId') hotelId: string, @Request() req) {
    return this.ratingsService.getUserRatingForHotel(hotelId, req.user.id);
  }

  @Roles('admin', 'user')
  @Get('my-ratings')
  findMyRatings(@Request() req) {
    return this.ratingsService.findByUser(req.user.id);
  }

  @Roles('admin', 'user')
  @Get(':id')
  @Roles('admin', 'user')
  findOne(@Param('id') id: string) {
    return this.ratingsService.findOne(id);
  }

  @Roles('admin', 'user')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRatingDto: UpdateRatingDto,
    @Request() req,
  ) {
    return this.ratingsService.update(id, updateRatingDto, req.user.id);
  }

  @Roles('user')
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.ratingsService.remove(id, req.user.id);
  }

  @Roles('admin')
  @Delete('admin/:id')
  removeByAdmin(@Param('id') id: string) {
    return this.ratingsService.removeByAdmin(id);
  }
}
