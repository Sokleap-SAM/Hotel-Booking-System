import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Room } from './room.entity';
import { BedType } from '../../bed-types/entities/bed-type.entity';

@Entity()
export class RoomBed {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Room, (room) => room.roomBeds, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId' })
  room: Room;

  @Column()
  roomId: string;

  @ManyToOne(() => BedType, (bedType) => bedType.roomBeds, { eager: true })
  @JoinColumn({ name: 'bedTypeId' })
  bedType: BedType;

  @Column()
  bedTypeId: number;

  @Column({ default: 1 })
  quantity: number;
}
