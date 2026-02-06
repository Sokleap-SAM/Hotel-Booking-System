import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import DatabaseConfig from './config/db.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelsModule } from './hotels/hotels.module';
import { RoomsModule } from './rooms/rooms.module';
import { AuthModule } from './auth/auth.module';
import { HotelCardModule } from './hotelCard/hotelCard.module';
import { BedTypesModule } from './bed-types/bed-types.module';
import { AmenitiesModule } from './amenities/amenities.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [DatabaseConfig],
      envFilePath: '../.env',
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
        autoLoadEntities: true,
        synchronize: true, // Auto-creates tables (only for development!)
      }),
    }),
    HotelCardModule,
    HotelsModule,
    RoomsModule,
    AuthModule,
    BedTypesModule,
    AmenitiesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
