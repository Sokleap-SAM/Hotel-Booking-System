import { Hotel } from 'src/hotels/entities/hotel.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  shortDescription: string;

  @Column('text')
  longDescription: string;

  @Column()
  type: string;

  @Column()
  available: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  maxOccupancy: number;

  @Column({ default: 0 })
  discountPercentage: number;

  @Column('simple-array')
  images: string[];

  @Column('simple-array')
  amenities: string[];

  @Column({ nullable: true })
  otherAmenities: string;

  @ManyToOne(() => Hotel, (hotel) => hotel.rooms)
  @JoinColumn({ name: 'hotelId' })
  hotel: Hotel;

  @Column()
  hotelId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
