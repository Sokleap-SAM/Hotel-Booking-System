import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Booking } from './booking.entity';
import { Room } from 'src/rooms/entities/room.entity';

@Entity()
export class BookingItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  bookingId: string;

  @ManyToOne(() => Booking, (booking) => booking.bookingItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @Column({ nullable: true })
  roomId: string;

  @ManyToOne(() => Room, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'roomId' })
  room: Room;

  // Snapshot fields to preserve booking history even if room/hotel is deleted
  @Column({ nullable: true })
  roomName: string;

  @Column({ nullable: true })
  hotelName: string;

  @Column({ type: 'date' })
  checkIn: Date;

  @Column({ type: 'date' })
  checkOut: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  priceAtBooking: number;
}
