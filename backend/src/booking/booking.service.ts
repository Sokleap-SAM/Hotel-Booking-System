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
import { RoomsService } from '../rooms/rooms.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    private readonly roomsService: RoomsService,
  ) {}

  async create(userId: string, createBookingDto: CreateBookingDto) {
    const { roomSelections } = createBookingDto;

    // Validate guest date of birth (must be 16+)
    if (createBookingDto.guestDateOfBirth) {
      const birthDate = new Date(createBookingDto.guestDateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      if (age < 16) {
        throw new BadRequestException(
          'Guest must be at least 16 years old to make a booking',
        );
      }
    }

    let totalPrice = 0;
    const bookingItems: Partial<BookingItem>[] = [];

    // Group selections by roomId to validate total quantity per room type
    const roomQuantities = new Map<string, number>();
    for (const selection of roomSelections) {
      const count = roomQuantities.get(selection.roomId) || 0;
      roomQuantities.set(selection.roomId, count + 1);
    }

    // Validate availability for each room type before processing
    for (const [roomId, requestedQuantity] of roomQuantities) {
      const room = await this.roomRepository.findOne({
        where: { id: roomId },
      });

      if (!room) {
        throw new NotFoundException(`Room with id ${roomId} not found`);
      }

      // Use dates from first selection for this room
      const firstSelection = roomSelections.find((s) => s.roomId === roomId);
      if (!firstSelection) {
        throw new NotFoundException(`No selection found for room ${roomId}`);
      }
      const checkIn = new Date(firstSelection.checkIn);
      const checkOut = new Date(firstSelection.checkOut);

      const availableCount = await this.roomsService.getAvailableRoomCount(
        roomId,
        checkIn,
        checkOut,
      );

      if (availableCount < requestedQuantity) {
        throw new BadRequestException(
          `Room "${room.name}" only has ${availableCount} available for the selected dates, but you requested ${requestedQuantity}`,
        );
      }
    }

    // Process each room selection
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
      relations: [
        'bookingItems',
        'bookingItems.room',
        'bookingItems.room.hotel',
      ],
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
    booking.confirmedAt = new Date();
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
    const itemsMap = new Map<
      string,
      {
        roomId: string;
        roomName: string;
        pricePerNight: number;
        nights: number;
        discount: number;
        quantity: number;
        itemTotal: number;
      }
    >();

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

      // Group by roomId - each selection represents 1 unit
      const existingItem = itemsMap.get(room.id);
      if (existingItem) {
        existingItem.quantity += 1;
        existingItem.itemTotal += itemTotal;
      } else {
        itemsMap.set(room.id, {
          roomId: room.id,
          roomName: room.name,
          pricePerNight: discountedPrice,
          nights,
          discount,
          quantity: 1,
          itemTotal,
        });
      }

      subtotal += itemTotal;
    }

    // Convert map to array and round values
    const items = Array.from(itemsMap.values()).map((item) => ({
      ...item,
      itemTotal: Math.round(item.itemTotal * 100) / 100,
    }));

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
