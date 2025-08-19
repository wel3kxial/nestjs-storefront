import { Module } from '@nestjs/common';
import { BookingService } from './services/booking.service';

@Module({
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}