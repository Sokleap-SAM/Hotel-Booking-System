import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from '../entities/payment.entity';
import { Booking, BookingStatus } from 'src/booking/entities/booking.entity';
import { CreateStripePaymentDto } from './dto/create-stripe-payment.dto';
import { StripeCheckoutResponseDto } from './dto/stripe-response.dto';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (stripeSecretKey) {
      this.stripe = new Stripe(stripeSecretKey);
    }
  }

  async createCheckoutSession(
    dto: CreateStripePaymentDto,
    userId: number,
  ): Promise<StripeCheckoutResponseDto> {
    if (!this.stripe) {
      throw new BadRequestException(
        'Stripe is not configured. Set STRIPE_SECRET_KEY in your .env file.',
      );
    }

    const booking = await this.bookingRepository.findOne({
      where: { id: dto.bookingId },
      relations: [
        'bookingItems',
        'bookingItems.room',
        'bookingItems.room.hotel',
      ],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Booking must be approved before payment');
    }

    // Check for existing pending Stripe payment
    const existingPayment = await this.paymentRepository.findOne({
      where: {
        bookingId: dto.bookingId,
        paymentMethod: PaymentMethod.STRIPE,
        status: PaymentStatus.PENDING,
      },
    });

    if (existingPayment?.stripeCheckoutSessionId) {
      try {
        const existingSession = await this.stripe.checkout.sessions.retrieve(
          existingPayment.stripeCheckoutSessionId,
        );
        // If session is still open, return it
        if (existingSession.status === 'open' && existingSession.url) {
          return {
            paymentId: existingPayment.id,
            checkoutUrl: existingSession.url,
            sessionId: existingPayment.stripeCheckoutSessionId,
            amount: Number(booking.totalPrice),
            currency: 'usd',
            status: existingPayment.status,
          };
        }
      } catch {
        // Session expired or invalid, create a new one
      }
    }

    const amountInCents = Math.round(Number(booking.totalPrice) * 100);

    // Build line items description from booking
    const hotelName =
      booking.bookingItems?.[0]?.room?.hotel?.name || 'Hotel Booking';
    const roomCount = booking.bookingItems?.length || 1;

    // Use DTO URLs if provided, otherwise fall back to env or defaults
    const successUrl =
      dto.successUrl ||
      this.configService.get<string>('STRIPE_SUCCESS_URL') ||
      'http://localhost:5173/payment/success?session_id={CHECKOUT_SESSION_ID}';
    const cancelUrl =
      dto.cancelUrl ||
      this.configService.get<string>('STRIPE_CANCEL_URL') ||
      'http://localhost:5173/payment/cancel';

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${hotelName} - Room Booking`,
              description: `${roomCount} room(s) - Booking #${dto.bookingId.slice(0, 8)}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: dto.bookingId,
        userId: String(userId),
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    const payment = this.paymentRepository.create({
      bookingId: dto.bookingId,
      userId,
      amount: booking.totalPrice,
      paymentMethod: PaymentMethod.STRIPE,
      status: PaymentStatus.PENDING,
      stripeCheckoutSessionId: session.id,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    return {
      paymentId: savedPayment.id,
      checkoutUrl: session.url!,
      sessionId: session.id,
      amount: Number(booking.totalPrice),
      currency: 'usd',
      status: savedPayment.status,
    };
  }

  /**
   * Verify payment status directly with Stripe API.
   * Used when webhooks can't reach the server (e.g., localhost development).
   */
  async verifyAndUpdatePayment(sessionId: string): Promise<{
    success: boolean;
    paymentStatus: string;
    bookingStatus: string;
    bookingId?: string;
  }> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    // Get the checkout session from Stripe
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);

    // Find the payment by session ID
    const payment = await this.paymentRepository.findOne({
      where: { stripeCheckoutSessionId: sessionId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found for this session');
    }

    // If already completed, just return current status
    if (payment.status === PaymentStatus.COMPLETED) {
      const booking = await this.bookingRepository.findOne({
        where: { id: payment.bookingId },
      });
      return {
        success: true,
        paymentStatus: payment.status,
        bookingStatus: booking?.status || 'unknown',
        bookingId: payment.bookingId,
      };
    }

    // Check if Stripe session shows payment completed
    if (session.payment_status === 'paid') {
      // Update payment status
      payment.status = PaymentStatus.COMPLETED;
      payment.transactionId = session.id;
      payment.completedAt = new Date();

      // Try to get card details
      if (session.payment_intent) {
        try {
          const paymentIntent = await this.stripe.paymentIntents.retrieve(
            session.payment_intent as string,
            { expand: ['latest_charge'] },
          );
          const charge = paymentIntent.latest_charge;
          if (
            typeof charge === 'object' &&
            charge?.payment_method_details?.card
          ) {
            const card = charge.payment_method_details.card;
            payment.cardLast4 = card.last4 || '';
            payment.cardBrand = card.brand || '';
          }
          payment.stripePaymentIntentId = paymentIntent.id;
        } catch {
          // Could not get card details, proceed anyway
        }
      }

      await this.paymentRepository.save(payment);

      // Update booking status to COMPLETED
      await this.bookingRepository.update(payment.bookingId, {
        status: BookingStatus.COMPLETED,
      });

      this.logger.log(
        `Payment verified and updated for booking: ${payment.bookingId}`,
      );

      return {
        success: true,
        paymentStatus: PaymentStatus.COMPLETED,
        bookingStatus: BookingStatus.COMPLETED,
        bookingId: payment.bookingId,
      };
    }

    return {
      success: false,
      paymentStatus: payment.status,
      bookingStatus: 'confirmed',
      bookingId: payment.bookingId,
    };
  }

  /**
   * Handle Stripe webhook events.
   * Processes checkout.session.completed and checkout.session.expired events.
   */
  async handleWebhook(
    rawBody: Buffer,
    signature: string,
  ): Promise<{ received: boolean }> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    if (!webhookSecret) {
      throw new BadRequestException('Stripe webhook secret is not configured');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Webhook signature verification failed: ${message}`);
      throw new BadRequestException('Invalid webhook signature');
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case 'checkout.session.expired':
        await this.handleCheckoutSessionExpired(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      default:
        this.logger.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return { received: true };
  }

  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { stripeCheckoutSessionId: session.id },
    });

    if (!payment) {
      this.logger.warn(`No payment found for Checkout Session: ${session.id}`);
      return;
    }

    // Get card details from the payment intent if available
    if (session.payment_intent) {
      try {
        const paymentIntent = await this.stripe.paymentIntents.retrieve(
          session.payment_intent as string,
          { expand: ['latest_charge'] },
        );
        const charge = paymentIntent.latest_charge;
        if (
          typeof charge === 'object' &&
          charge?.payment_method_details?.card
        ) {
          const card = charge.payment_method_details.card;
          payment.cardLast4 = card.last4 || '';
          payment.cardBrand = card.brand || '';
        }
        payment.stripePaymentIntentId = paymentIntent.id;
      } catch {
        // Could not get card details, proceed anyway
      }
    }

    payment.status = PaymentStatus.COMPLETED;
    payment.transactionId = session.id;
    payment.completedAt = new Date();
    await this.paymentRepository.save(payment);

    await this.bookingRepository.update(payment.bookingId, {
      status: BookingStatus.COMPLETED,
    });

    this.logger.log(
      `Stripe checkout completed for booking: ${payment.bookingId}`,
    );
  }

  private async handleCheckoutSessionExpired(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { stripeCheckoutSessionId: session.id },
    });

    if (!payment) {
      this.logger.warn(`No payment found for expired session: ${session.id}`);
      return;
    }

    payment.status = PaymentStatus.FAILED;
    payment.failureReason = 'Checkout session expired';
    await this.paymentRepository.save(payment);

    this.logger.log(
      `Stripe checkout expired for booking: ${payment.bookingId}`,
    );
  }
}
