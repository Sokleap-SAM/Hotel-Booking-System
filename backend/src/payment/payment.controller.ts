/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Param,
  Patch,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.dectorator';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get(':id/status')
  @UseGuards(AuthGuard('jwt'))
  getPaymentStatus(@Param('id') id: string) {
    return this.paymentService.getPaymentStatus(id);
  }

  @Get('booking/:bookingId')
  @UseGuards(AuthGuard('jwt'))
  getPaymentByBooking(@Param('bookingId') bookingId: string) {
    return this.paymentService.getPaymentByBooking(bookingId);
  }

  @Get('my-payments')
  @UseGuards(AuthGuard('jwt'))
  getUserPayments(@Request() req) {
    return this.paymentService.getUserPayments(req.user.id);
  }

  @Patch(':id/cancel')
  @UseGuards(AuthGuard('jwt'))
  cancelPayment(@Param('id') id: string, @Request() req) {
    return this.paymentService.cancelPayment(id, req.user.id);
  }

  @Post(':id/refund')
  @UseGuards(AuthGuard('jwt'))
  processRefund(@Param('id') id: string) {
    return this.paymentService.processRefund(id);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getAllPayments(
    @Query('status') status?: string,
    @Query('paymentMethod') paymentMethod?: string,
  ) {
    return this.paymentService.getAllPayments(status, paymentMethod);
  }

  @Get('admin/:id/details')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getPaymentDetails(@Param('id') id: string) {
    return this.paymentService.getPaymentDetails(id);
  }
}
