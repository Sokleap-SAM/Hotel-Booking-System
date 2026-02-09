import { Amenity } from 'src/amenities/entities/amenity.entity';
import { Room } from 'src/rooms/entities/room.entity';
import { Rating } from 'src/ratings/entities/rating.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';

export enum HotelStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPEND = 'suspend',
}

@Entity()
export class Hotel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: HotelStatus,
    default: HotelStatus.ACTIVE,
  })
  status: HotelStatus;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  avgRating: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  totalRating: number;

  @Column()
  name: string;

  @Column()
  shortDescription: string;

  @Column('text')
  longDescription: string;

  @Column()
  location: string;

  @Column()
  googleMapUrl: string;

  @Column('simple-array', { nullable: true })
  images: string[];

  @ManyToMany(() => Amenity, (amenity) => amenity.hotels)
  @JoinTable({ name: 'hotel_amenities_amenity' })
  amenities: Amenity[];

  @Column()
  phoneNumber: string;

  @Column()
  email: string;

  @OneToMany(() => Room, (room) => room.hotel)
  rooms: Room[];

  @OneToMany(() => Rating, (rating) => rating.hotel)
  ratings: Rating[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
