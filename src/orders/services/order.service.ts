import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { FulfillmentType } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async createFromCart(cartId: string, customerId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { id: cartId, customerId },
      include: {
        items: {
          include: {
            product: true,
            price: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new NotFoundException('Cart not found or empty');
    }

    const totalAmount = cart.items.reduce((sum, item) => {
      return sum + (item.price.unitAmount * item.quantity);
    }, 0);

    const order = await this.prisma.order.create({
      data: {
        customerId,
        totalAmount,
        currency: 'usd',
        status: 'DRAFT',
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            priceId: item.priceId,
            quantity: item.quantity,
            unitAmount: item.price.unitAmount,
            totalAmount: item.price.unitAmount * item.quantity,
            fulfillmentType: this.determineFulfillmentType(item.product.type),
            reservationId: item.slotId ? undefined : undefined, // Handle reservation linking
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
            price: true,
          },
        },
      },
    });

    // Clear the cart
    await this.prisma.cartItem.deleteMany({
      where: { cartId },
    });

    return order;
  }

  async findUserOrders(customerId: string) {
    return this.prisma.order.findMany({
      where: { customerId },
      include: {
        items: {
          include: {
            product: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, customerId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
            price: true,
            reservation: {
              include: {
                timeSlot: {
                  include: { resource: true },
                },
              },
            },
            digitalEntitlement: true,
          },
        },
        payments: true,
        refunds: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.customerId !== customerId) {
      throw new ForbiddenException('Access denied');
    }

    return order;
  }

  private determineFulfillmentType(productType: string): FulfillmentType {
    switch (productType) {
      case 'DIGITAL':
        return 'DIGITAL';
      case 'OFFLINE_SERVICE':
        return 'BOOKING';
      case 'ONLINE_CONSULTING':
        return 'CONSULTING';
      default:
        return 'DIGITAL';
    }
  }
}