import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-08-16',
    });
  }

  async createCheckoutSession(orderId: string, customerId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
            price: true,
          },
        },
        customer: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: item.price.currency,
        product_data: {
          name: item.product.title,
          description: item.product.description,
        },
        unit_amount: item.price.unitAmount,
      },
      quantity: item.quantity,
    }));

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${this.configService.get('FRONTEND_URL')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configService.get('FRONTEND_URL')}/cancel`,
      client_reference_id: orderId,
      customer_email: order.customer.email,
      metadata: {
        orderId,
        customerId,
        orderItemIds: order.items.map(item => item.id).join(','),
      },
      payment_intent_data: {
        metadata: {
          orderId,
          customerId,
        },
      },
    });

    // Update order with checkout session ID
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        stripeCheckoutSessionId: session.id,
        status: 'PENDING',
      },
    });

    return session;
  }

  async createRefund(paymentIntentId: string, amount?: number, reason?: string) {
    return this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount,
      reason: reason as Stripe.RefundCreateParams.Reason,
    });
  }

  async constructEvent(body: Buffer, signature: string) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    return this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
  }

  async retrieveSession(sessionId: string) {
    return this.stripe.checkout.sessions.retrieve(sessionId);
  }

  async retrievePaymentIntent(paymentIntentId: string) {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }
}