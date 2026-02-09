import { Amenity } from 'src/amenities/entities/amenity.entity';
import { Hotel } from 'src/hotels/entities/hotel.entity';
import { RoomBed } from './room-bed.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';

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

  @OneToMany(() => RoomBed, (roomBed) => roomBed.room, {
    cascade: true,
    eager: true,
  })
  roomBeds: RoomBed[];

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  roomSize: number;

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
