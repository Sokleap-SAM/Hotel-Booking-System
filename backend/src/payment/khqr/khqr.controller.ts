/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { KhqrService } from './khqr.service';
import { CreateKhqrPaymentDto } from './dto/create-khqr-payment.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments/khqr')
export class KhqrController {
  constructor(private readonly khqrService: KhqrService) {}

  @Post()
  initializeKhqrPayment(@Body() dto: CreateKhqrPaymentDto, @Request() req) {
    return this.khqrService.initializeKhqrPayment(dto, req.user.id);
  }

  @Post(':id/confirm')
  confirmKhqrPayment(@Param('id') id: string) {
    return this.khqrService.confirmKhqrPayment(id);
  }
}
