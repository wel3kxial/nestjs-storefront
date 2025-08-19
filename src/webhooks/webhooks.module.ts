import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { WebhookController } from './controllers/webhook.controller';
import { WebhookService } from './services/webhook.service';
import { StripeWebhookProcessor } from './processors/stripe-webhook.processor';
import { PaymentsModule } from '../payments/payments.module';
import { OrdersModule } from '../orders/orders.module';
import { DeliveryModule } from '../delivery/delivery.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'webhook-processing',
    }),
    PaymentsModule,
    OrdersModule,
    DeliveryModule,
  ],
  controllers: [WebhookController],
  providers: [WebhookService, StripeWebhookProcessor],
})
export class WebhooksModule {}