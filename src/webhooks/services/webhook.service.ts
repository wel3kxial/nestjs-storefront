import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StripeService } from '../../payments/services/stripe.service';

@Injectable()
export class WebhookService {
  constructor(
    @InjectQueue('webhook-processing') private webhookQueue: Queue,
    private prisma: PrismaService,
    private stripeService: StripeService,
  ) {}

  async handleStripeWebhook(body: Buffer, signature: string) {
    try {
      const event = await this.stripeService.constructEvent(body, signature);
      
      // Add to queue for processing with idempotency
      await this.webhookQueue.add(
        'process-stripe-event',
        {
          eventId: event.id,
          eventType: event.type,
          eventData: event.data,
        },
        {
          jobId: event.id, // Use event ID as job ID for idempotency
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      );

      return { received: true };
    } catch (error) {
      throw new Error(`Webhook signature verification failed: ${error.message}`);
    }
  }

  async processCheckoutCompleted(sessionId: string) {
    const session = await this.stripeService.retrieveSession(sessionId);
    const orderId = session.client_reference_id;

    if (!orderId) {
      throw new Error('No order ID in session');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { include: { stockItems: true } },
            reservation: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Create payment record
    await this.prisma.payment.create({
      data: {
        orderId,
        stripePaymentIntentId: session.payment_intent as string,
        amount: session.amount_total,
        currency: session.currency,
        status: 'SUCCEEDED',
      },
    });

    // Update order status
    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID' },
    });

    // Process each order item
    for (const item of order.items) {
      // Commit stock for digital products
      if (item.product.type === 'DIGITAL' && item.product.stockItems.length > 0) {
        const stockItem = item.product.stockItems[0];
        if (stockItem.managed) {
          await this.prisma.stockItem.update({
            where: { id: stockItem.id },
            data: {
              quantity: { decrement: item.quantity },
              holdQuantity: { decrement: item.quantity },
            },
          });

          await this.prisma.stockLedger.create({
            data: {
              stockItemId: stockItem.id,
              change: -item.quantity,
              reason: 'COMMIT',
              orderId,
            },
          });
        }

        // Trigger digital fulfillment
        await this.webhookQueue.add('fulfill-digital', {
          orderItemId: item.id,
          productType: item.product.type,
        });
      }

      // Confirm reservations for booking products
      if (item.reservation) {
        await this.prisma.reservation.update({
          where: { id: item.reservation.id },
          data: {
            status: 'CONFIRMED',
            confirmedAt: new Date(),
          },
        });

        // Trigger booking confirmation
        await this.webhookQueue.add('confirm-booking', {
          reservationId: item.reservation.id,
          orderItemId: item.id,
        });
      }
    }

    // Update order to fulfilled
    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'FULFILLED' },
    });

    return { processed: true };
  }

  async processPaymentFailed(paymentIntentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: { include: { stockItems: true } },
                reservation: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return { processed: false };
    }

    // Update payment status
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED' },
    });

    // Update order status
    await this.prisma.order.update({
      where: { id: payment.orderId },
      data: { status: 'CANCELLED' },
    });

    // Release holds
    for (const item of payment.order.items) {
      // Release stock holds
      if (item.product.type === 'DIGITAL' && item.product.stockItems.length > 0) {
        const stockItem = item.product.stockItems[0];
        if (stockItem.managed) {
          await this.prisma.stockItem.update({
            where: { id: stockItem.id },
            data: { holdQuantity: { decrement: item.quantity } },
          });

          await this.prisma.stockLedger.create({
            data: {
              stockItemId: stockItem.id,
              change: item.quantity,
              reason: 'RELEASE',
              orderId: payment.orderId,
            },
          });
        }
      }

      // Release reservations
      if (item.reservation) {
        await this.prisma.reservation.update({
          where: { id: item.reservation.id },
          data: { status: 'CANCELLED' },
        });

        await this.prisma.timeSlot.update({
          where: { id: item.reservation.timeSlotId },
          data: { reserved: { decrement: 1 } },
        });
      }
    }

    return { processed: true };
  }
}