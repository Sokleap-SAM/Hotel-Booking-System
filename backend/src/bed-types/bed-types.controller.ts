import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { BedTypesService } from './bed-types.service';
import { CreateBedTypeDto } from './dto/create-bed-type.dto';
import { UpdateBedTypeDto } from './dto/update-bed-type.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.dectorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bed-types')
export class BedTypesController {
  constructor(private readonly bedTypesService: BedTypesService) {}

  @Roles('admin')
  @Post()
  create(@Body() createBedTypeDto: CreateBedTypeDto) {
    return this.bedTypesService.create(createBedTypeDto);
  }

  @Roles('admin', 'user')
  @Get()
  findAll() {
    return this.bedTypesService.findAll();
  }

  @Roles('admin', 'user')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bedTypesService.findOne(id);
  }

  @Roles('admin')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBedTypeDto: UpdateBedTypeDto,
  ) {
    return this.bedTypesService.update(id, updateBedTypeDto);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bedTypesService.remove(id);
  }
}
