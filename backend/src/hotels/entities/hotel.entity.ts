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

export enum Destination {
  BANTEAY_MEANCHEY = 'Banteay Meanchey',
  BATTAMBANG = 'Battambang',
  KAMPONG_CHAM = 'Kampong Cham',
  KAMPONG_CHHNANG = 'Kampong Chhnang',
  KAMPONG_SPEU = 'Kampong Speu',
  KAMPONG_THOM = 'Kampong Thom',
  KAMPOT = 'Kampot',
  KANDAL = 'Kandal',
  KEP = 'Kep',
  KOH_KONG = 'Koh Kong',
  TAKEO = 'Takéo',
  MONDULKIRI = 'Mondulkiri',
  ODDAR_MEANCHEY = 'Oddar Meanchey',
  PAILIN = 'Pailin',
  PHNOM_PENH = 'Phnom Penh',
  PREAH_SIHANOUK = 'Preah Sihanouk',
  PREAH_VIHEAR = 'Preah Vihear',
  PREY_VENG = 'Prey Veng',
  PURSAT = 'Pursat',
  RATANAKIRI = 'Ratanakiri',
  SIEM_REAP = 'Siem Reap',
  STUNG_TRENG = 'Stung Treng',
  SVAY_RIENG = 'Svay Rieng',
  TBOUNG_KHMUM = 'Tboung Khmum',
}

@Entity()
export class Hotel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: Destination,
  })
  destination: Destination;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  avgRating: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  totalRating: number;

  @Column({ unique: true })
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

  @Column({ unique: true })
  email: string;

  @OneToMany(() => Room, (room) => room.hotel)
  rooms: Room[];

  @OneToMany(() => Rating, (rating) => rating.hotel)
  ratings: Rating[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
