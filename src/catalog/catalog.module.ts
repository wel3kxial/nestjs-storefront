import { Module } from '@nestjs/common';
import { ProductService } from './services/product.service';
import { PriceService } from './services/price.service';
import { ProductController } from './controllers/product.controller';
import { PriceController } from './controllers/price.controller';

@Module({
  providers: [ProductService, PriceService],
  controllers: [ProductController, PriceController],
  exports: [ProductService, PriceService],
})
export class CatalogModule {}