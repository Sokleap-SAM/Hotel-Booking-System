import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import DatabaseConfig from './config/db.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HotelsModule } from './hotels/hotels.module';
import { RoomsModule } from './rooms/rooms.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './auth/admin/admin.module';
import { BedTypesModule } from './bed-types/bed-types.module';
import { AmenitiesModule } from './amenities/amenities.module';
import { BookingModule } from './booking/booking.module';
import { RatingsModule } from './ratings/ratings.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [DatabaseConfig],
      envFilePath:
        process.env.NODE_ENV === 'production' ? undefined : '../.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.username'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.database'),
        ssl: config.get('database.ssl'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    HotelsModule,
    RoomsModule,
    AuthModule,
    AdminModule,
    BedTypesModule,
    AmenitiesModule,
    BookingModule,
    RatingsModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
