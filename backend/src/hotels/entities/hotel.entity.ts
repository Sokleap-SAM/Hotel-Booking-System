import { Amenity } from 'src/amenities/entities/amenity.entity';
import { Room } from 'src/rooms/entities/room.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity()
export class Hotel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({ nullable: true })
  custom_amenities: string;

  @Column()
  phoneNumber: string;

  @Column()
  email: string;

  @OneToMany(() => Room, (room) => room.hotel)
  rooms: Room[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
