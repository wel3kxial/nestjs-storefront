import { Module } from '@nestjs/common';
import { StripeService } from './services/stripe.service';
import { PaymentService } from './services/payment.service';
import { PaymentController } from './controllers/payment.controller';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [OrdersModule],
  providers: [StripeService, PaymentService],
  controllers: [PaymentController],
  exports: [StripeService, PaymentService],
})
export class PaymentsModule {}