import { Amenity } from 'src/amenities/entities/amenity.entity';
import { Hotel } from 'src/hotels/entities/hotel.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

export enum RoomCategory {
  SINGLE = 'Single',
  DOUBLE = 'Double',
  TWIN = 'Twin',
  DELUXE = 'Deluxe',
  SUITE = 'Suite',
  PENTHOUSE = 'Penthouse',
}

@Entity()
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  shortDescription: string;

  @Column('text')
  longDescription: string;

  @Column({
    type: 'enum',
    enum: RoomCategory,
    default: RoomCategory.SINGLE,
  })
  type: RoomCategory;

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

  @ManyToMany(() => Amenity)
  @JoinTable()
  amenities: Amenity[];

  @Column({ type: 'text', nullable: true })
  custom_amenities: string;

  @ManyToOne(() => Hotel, (hotel) => hotel.rooms, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'hotelId' })
  hotel: Hotel;

  @Column()
  hotelId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
