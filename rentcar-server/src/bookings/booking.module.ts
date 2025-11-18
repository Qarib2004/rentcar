import { Module } from '@nestjs/common';
import { BookingsController } from './booking.controller';
import { BookingService } from './booking.service';

@Module({
  controllers: [BookingsController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingsModule {}
