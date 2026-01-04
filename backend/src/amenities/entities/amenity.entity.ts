import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Room } from '../../rooms/entities/room.entity';
import { Hotel } from 'src/hotels/entities/hotel.entity';

export enum AmenityCategory {
  HOTEL = 'hotel',
  ROOM = 'room',
}

@Entity()
export class Amenity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'enum', enum: AmenityCategory })
  category: AmenityCategory;

  @ManyToMany(() => Room, (room) => room.amenities)
  rooms: Room[];

  @ManyToMany(() => Hotel, (hotel) => hotel.amenities)
  hotels: Hotel[];
}
