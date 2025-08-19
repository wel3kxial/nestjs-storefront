import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async createStockItem(productId: string, sku?: string, quantity: number = 0, managed: boolean = true) {
    return this.prisma.stockItem.create({
      data: {
        productId,
        sku,
        quantity,
        managed,
      },
    });
  }

  async updateStock(stockItemId: string, change: number, reason: 'HOLD' | 'COMMIT' | 'RELEASE' | 'REFUND', orderId?: string) {
    const stockItem = await this.prisma.stockItem.update({
      where: { id: stockItemId },
      data: {
        quantity: { increment: change },
      },
    });

    await this.prisma.stockLedger.create({
      data: {
        stockItemId,
        change,
        reason,
        orderId,
      },
    });

    return stockItem;
  }
}