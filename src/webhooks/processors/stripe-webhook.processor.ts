import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { WebhookService } from '../services/webhook.service';

@Injectable()
@Processor('webhook-processing')
export class StripeWebhookProcessor {
  constructor(private webhookService: WebhookService) {}

  @Process('process-stripe-event')
  async handleStripeEvent(job: Job) {
    const { eventType, eventData } = job.data;

    switch (eventType) {
      case 'checkout.session.completed':
        return this.webhookService.processCheckoutCompleted(eventData.object.id);
      
      case 'payment_intent.succeeded':
        // Additional processing if needed
        break;
      
      case 'payment_intent.payment_failed':
        return this.webhookService.processPaymentFailed(eventData.object.id);
      
      case 'charge.refunded':
        // Handle refund processing
        break;
      
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }
  }

  @Process('fulfill-digital')
  async fulfillDigital(job: Job) {
    const { orderItemId, productType } = job.data;
    // Implement digital fulfillment logic
    console.log(`Fulfilling digital product for order item: ${orderItemId}`);
  }

  @Process('confirm-booking')
  async confirmBooking(job: Job) {
    const { reservationId, orderItemId } = job.data;
    // Implement booking confirmation logic
    console.log(`Confirming booking for reservation: ${reservationId}`);
  }
}