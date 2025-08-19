import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StripeService } from './stripe.service';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
  ) {}

  async createCheckoutSession(orderId: string, customerId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.customerId !== customerId) {
      throw new ForbiddenException('Access denied');
    }

    if (order.status !== 'DRAFT') {
      throw new Error('Order is not in draft status');
    }

    const session = await this.stripeService.createCheckoutSession(orderId, customerId);

    return {
      url: session.url,
      sessionId: session.id,
    };
  }

  async createRefund(
    orderId: string,
    customerId: string,
    amount?: number,
    reason?: string,
    orderItemIds?: string[]
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        payments: { where: { status: 'SUCCEEDED' } },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.customerId !== customerId) {
      throw new ForbiddenException('Access denied');
    }

    if (order.payments.length === 0) {
      throw new Error('No successful payment found for this order');
    }

    const payment = order.payments[0];
    const refundAmount = amount || order.totalAmount;

    // Create Stripe refund
    const stripeRefund = await this.stripeService.createRefund(
      payment.stripePaymentIntentId,
      refundAmount,
      reason
    );

    // Create refund record
    const refund = await this.prisma.refund.create({
      data: {
        orderId,
        orderItemId: orderItemIds?.length === 1 ? orderItemIds[0] : null,
        reason: reason || 'Customer request',
        amount: refundAmount,
        currency: payment.currency,
        stripeRefundId: stripeRefund.id,
        status: 'PENDING',
      },
    });

    return refund;
  }
}