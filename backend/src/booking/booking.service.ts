import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { BookingItem } from './entities/booking-item.entity';
import { Room } from '../rooms/entities/room.entity';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  async create(userId: string, createBookingDto: CreateBookingDto) {
    const { roomSelections } = createBookingDto;

    let totalPrice = 0;
    const bookingItems: Partial<BookingItem>[] = [];

    for (const selection of roomSelections) {
      const room = await this.roomRepository.findOne({
        where: { id: selection.roomId },
      });

      if (!room) {
        throw new NotFoundException(
          `Room with id ${selection.roomId} not found`,
        );
      }

      const checkIn = new Date(selection.checkIn);
      const checkOut = new Date(selection.checkOut);

      if (checkOut <= checkIn) {
        throw new BadRequestException(
          'Check-out date must be after check-in date',
        );
      }

      const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
      );

      const basePrice = Number(room.price);
      const discount = room.discountPercentage || 0;
      const discountedPrice = basePrice * (1 - discount / 100);
      const priceAtBooking = discountedPrice * nights;

      totalPrice += priceAtBooking;

      bookingItems.push({
        roomId: room.id,
        checkIn: new Date(selection.checkIn),
        checkOut: new Date(selection.checkOut),
        priceAtBooking: Math.round(priceAtBooking * 100) / 100,
      });
    }

    // Add 10% tax
    const tax = totalPrice * 0.1;
    totalPrice = Math.round((totalPrice + tax) * 100) / 100;

    const booking = this.bookingRepository.create({
      userId,
      totalPrice,
      status: BookingStatus.PENDING,
      guestDateOfBirth: createBookingDto.guestDateOfBirth
        ? new Date(createBookingDto.guestDateOfBirth)
        : undefined,
      guestPhone: createBookingDto.guestPhone,
      bookingItems: bookingItems as BookingItem[],
    });

    return await this.bookingRepository.save(booking);
  }

  async findAllByUser(userId: string) {
    return await this.bookingRepository.find({
      where: { userId },
      relations: ['bookingItems', 'bookingItems.room'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId?: string) {
    const where: Record<string, string> = { id };
    if (userId) {
      where.userId = userId;
    }

    const booking = await this.bookingRepository.findOne({
      where,
      relations: [
        'bookingItems',
        'bookingItems.room',
        'bookingItems.room.hotel',
      ],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with id ${id} not found`);
    }

    return booking;
  }

  async cancel(id: string, userId: string) {
    const booking = await this.findOne(id, userId);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed booking');
    }

    booking.status = BookingStatus.CANCELLED;
    return await this.bookingRepository.save(booking);
  }

  async confirm(id: string) {
    const booking = await this.findOne(id);

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be confirmed');
    }

    booking.status = BookingStatus.CONFIRMED;
    return await this.bookingRepository.save(booking);
  }

  async findAllAdmin() {
    return await this.bookingRepository.find({
      relations: [
        'bookingItems',
        'bookingItems.room',
        'bookingItems.room.hotel',
        'user',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async approve(id: string) {
    const booking = await this.findOne(id);

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be approved');
    }

    booking.status = BookingStatus.CONFIRMED;
    return await this.bookingRepository.save(booking);
  }

  async reject(id: string, reason: string) {
    const booking = await this.findOne(id);

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be rejected');
    }

    booking.status = BookingStatus.CANCELLED;
    booking.rejectionReason = reason;
    return await this.bookingRepository.save(booking);
  }

  async calculatePrice(createBookingDto: CreateBookingDto) {
    const { roomSelections } = createBookingDto;
    let subtotal = 0;
    const items: {
      roomId: string;
      roomName: string;
      pricePerNight: number;
      nights: number;
      discount: number;
      itemTotal: number;
    }[] = [];

    for (const selection of roomSelections) {
      const room = await this.roomRepository.findOne({
        where: { id: selection.roomId },
      });

      if (!room) {
        throw new NotFoundException(
          `Room with id ${selection.roomId} not found`,
        );
      }

      const checkIn = new Date(selection.checkIn);
      const checkOut = new Date(selection.checkOut);
      const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
      );

      const basePrice = Number(room.price);
      const discount = room.discountPercentage || 0;
      const discountedPrice = basePrice * (1 - discount / 100);
      const itemTotal = discountedPrice * nights;

      subtotal += itemTotal;

      items.push({
        roomId: room.id,
        roomName: room.name,
        pricePerNight: discountedPrice,
        nights,
        discount,
        itemTotal: Math.round(itemTotal * 100) / 100,
      });
    }

    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    return {
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }
}
