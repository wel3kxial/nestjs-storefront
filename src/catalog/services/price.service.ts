import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class PriceService {
  constructor(private prisma: PrismaService) {}
}