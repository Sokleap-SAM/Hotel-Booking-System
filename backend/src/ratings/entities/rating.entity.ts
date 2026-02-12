import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Hotel } from 'src/hotels/entities/hotel.entity';
import { User } from 'src/auth/user/entities/user.entity';

@Entity()
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  hotelId: string;

  @ManyToOne(() => Hotel, (hotel) => hotel.ratings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hotelId' })
  hotel: Hotel;

  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Category ratings (1-10 scale)
  @Column({ type: 'decimal', precision: 3, scale: 1 })
  service: number;

  @Column({ type: 'decimal', precision: 3, scale: 1 })
  facilities: number;

  @Column({ type: 'decimal', precision: 3, scale: 1 })
  comfort: number;

  @Column({ type: 'decimal', precision: 3, scale: 1 })
  value: number;

  @Column({ type: 'decimal', precision: 3, scale: 1 })
  location: number;

  // Overall score (1-5 scale, calculated from category averages)
  @Column({ type: 'decimal', precision: 2, scale: 1 })
  overallScore: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;
}
