import { Module } from '@nestjs/common';
import { CartService } from './services/cart.service';
import { OrderService } from './services/order.service';
import { CartController } from './controllers/cart.controller';
import { OrderController } from './controllers/order.controller';
import { InventoryModule } from '../inventory/inventory.module';
import { BookingModule } from '../booking/booking.module';

@Module({
  imports: [InventoryModule, BookingModule],
  providers: [CartService, OrderService],
  controllers: [CartController, OrderController],
  exports: [CartService, OrderService],
})
export class OrdersModule {}