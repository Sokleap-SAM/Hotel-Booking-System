/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentMethod } from './entities/payment.entity';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('khqr')
  @UseGuards(AuthGuard('jwt'))
  initializeKhqrPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req,
  ) {
    createPaymentDto.paymentMethod = PaymentMethod.KHQR;
    return this.paymentsService.initializeKhqrPayment(
      createPaymentDto,
      req.user.id,
    );
  }

  @Post('card')
  @UseGuards(AuthGuard('jwt'))
  processCardPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req,
  ) {
    createPaymentDto.paymentMethod = PaymentMethod.CARD;
    return this.paymentsService.processCardPayment(
      createPaymentDto,
      req.user.id,
    );
  }

  @Post(':id/confirm-khqr')
  @UseGuards(AuthGuard('jwt'))
  confirmKhqrPayment(@Param('id') id: string) {
    return this.paymentsService.confirmKhqrPayment(id);
  }

  @Get(':id/status')
  @UseGuards(AuthGuard('jwt'))
  getPaymentStatus(@Param('id') id: string) {
    return this.paymentsService.getPaymentStatus(id);
  }

  @Get('booking/:bookingId')
  @UseGuards(AuthGuard('jwt'))
  getPaymentByBooking(@Param('bookingId') bookingId: string) {
    return this.paymentsService.getPaymentByBooking(bookingId);
  }

  @Get('my-payments')
  @UseGuards(AuthGuard('jwt'))
  getUserPayments(@Request() req) {
    return this.paymentsService.getUserPayments(req.user.id);
  }

  @Patch(':id/cancel')
  @UseGuards(AuthGuard('jwt'))
  cancelPayment(@Param('id') id: string, @Request() req) {
    return this.paymentsService.cancelPayment(id, req.user.id);
  }

  @Post(':id/refund')
  @UseGuards(AuthGuard('jwt'))
  processRefund(@Param('id') id: string) {
    return this.paymentsService.processRefund(id);
  }
}
