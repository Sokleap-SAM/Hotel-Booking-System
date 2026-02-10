import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BookingItem } from './booking-item.entity';
import { User } from 'src/auth/user/entities/user.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity()
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ type: 'date', nullable: true })
  guestDateOfBirth: Date;

  @Column({ nullable: true })
  guestPhone: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => BookingItem, (bookingItem) => bookingItem.booking, {
    cascade: true,
    eager: true,
  })
  bookingItems: BookingItem[];
}
