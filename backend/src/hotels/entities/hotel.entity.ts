// src/hotels/entities/hotel.entity.ts
import { Room } from 'src/rooms/entities/room.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

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

  @Column('simple-array')
  images: string[];

  @Column('simple-array')
  amenities: string[];

  @Column()
  phoneNumber: string;

  @Column()
  email: string;

  @OneToMany(() => Room, (room) => room.hotel)
  rooms: Room[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
