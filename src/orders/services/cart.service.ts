import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { FulfillmentType } from '@prisma/client';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async createCart(customerId: string) {
    return this.prisma.cart.create({
      data: {
        customerId,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      },
    });
  }

  async getCart(cartId: string, customerId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { id: cartId, customerId },
      include: {
        items: {
          include: {
            product: true,
            price: true,
            timeSlot: {
              include: { resource: true },
            },
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return cart;
  }

  async addItem(
    cartId: string,
    customerId: string,
    productId: string,
    priceId: string,
    quantity: number = 1,
    slotId?: string
  ) {
    const cart = await this.getCart(cartId, customerId);
    
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { stockItems: true, resources: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const price = await this.prisma.price.findFirst({
      where: { id: priceId, productId, active: true },
    });

    if (!price) {
      throw new NotFoundException('Price not found or inactive');
    }

    // For booking products, validate slot
    if (product.type === 'OFFLINE_SERVICE' || product.type === 'ONLINE_CONSULTING') {
      if (!slotId) {
        throw new BadRequestException('Time slot required for this product type');
      }

      const slot = await this.prisma.timeSlot.findUnique({
        where: { id: slotId },
        include: { reservations: true },
      });

      if (!slot || slot.reserved >= slot.capacity) {
        throw new BadRequestException('Time slot not available');
      }

      // Create reservation hold
      await this.prisma.reservation.create({
        data: {
          timeSlotId: slotId,
          customerId,
          status: 'HELD',
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes hold
        },
      });

      // Update slot reserved count
      await this.prisma.timeSlot.update({
        where: { id: slotId },
        data: { reserved: { increment: 1 } },
      });
    }

    // For digital products, check and hold stock
    if (product.type === 'DIGITAL' && product.stockItems.length > 0) {
      const stockItem = product.stockItems[0];
      if (stockItem.managed && stockItem.quantity - stockItem.holdQuantity < quantity) {
        throw new BadRequestException('Insufficient stock');
      }

      if (stockItem.managed) {
        await this.prisma.stockItem.update({
          where: { id: stockItem.id },
          data: { holdQuantity: { increment: quantity } },
        });

        await this.prisma.stockLedger.create({
          data: {
            stockItemId: stockItem.id,
            change: -quantity,
            reason: 'HOLD',
          },
        });
      }
    }

    // Add item to cart
    return this.prisma.cartItem.create({
      data: {
        cartId,
        productId,
        priceId,
        quantity,
        slotId,
      },
      include: {
        product: true,
        price: true,
        timeSlot: {
          include: { resource: true },
        },
      },
    });
  }

  async removeItem(cartId: string, customerId: string, itemId: string) {
    const cart = await this.getCart(cartId, customerId);
    
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId },
      include: {
        product: { include: { stockItems: true } },
        timeSlot: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    // Release holds
    if (item.slotId) {
      // Release slot reservation
      await this.prisma.reservation.deleteMany({
        where: {
          timeSlotId: item.slotId,
          customerId,
          status: 'HELD',
        },
      });

      await this.prisma.timeSlot.update({
        where: { id: item.slotId },
        data: { reserved: { decrement: 1 } },
      });
    }

    // Release stock hold
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
          },
        });
      }
    }

    return this.prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  async calculateTotal(cartId: string, customerId: string) {
    const cart = await this.getCart(cartId, customerId);
    
    const total = cart.items.reduce((sum, item) => {
      return sum + (item.price.unitAmount * item.quantity);
    }, 0);

    return { total, currency: 'usd' };
  }
}