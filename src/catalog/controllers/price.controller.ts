import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PriceService } from '../services/price.service';

@ApiTags('Prices')
@Controller('catalog/prices')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}
}