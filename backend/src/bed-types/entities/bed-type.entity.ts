import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RoomBed } from '../../rooms/entities/room-bed.entity';

@Entity()
export class BedType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => RoomBed, (roomBed) => roomBed.bedType)
  roomBeds: RoomBed[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
