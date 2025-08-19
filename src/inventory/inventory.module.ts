import { Module } from '@nestjs/common';
import { StockService } from './services/stock.service';

@Module({
  providers: [StockService],
  exports: [StockService],
})
export class InventoryModule {}