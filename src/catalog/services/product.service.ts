import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductType, UserRole, Prisma } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, merchantId: string) {
    return this.prisma.product.create({
      data: {
        ...createProductDto,
        merchantId,
      },
      include: {
        prices: true,
        stockItems: true,
      },
    });
  }

  async findAll(
    type?: ProductType,
    search?: string,
    merchantId?: string,
    userRole?: UserRole
  ) {
    const where = {
      ...(type && { type }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ],
      }),
      ...(userRole === UserRole.MERCHANT && merchantId && { merchantId }),
      ...(userRole === UserRole.CUSTOMER && { status: 'ACTIVE' }),
    };

    return this.prisma.product.findMany({
      where,
      include: {
        prices: {
          where: { active: true },
        },
        stockItems: true,
        resources: userRole === UserRole.CUSTOMER ? {
          include: {
            timeSlots: {
              where: {
                startsAt: { gte: new Date() },
                isActive: true,
              },
            },
          },
        } : true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId?: string, userRole?: UserRole) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        prices: { where: { active: true } },
        stockItems: true,
        resources: {
          include: {
            timeSlots: {
              where: {
                startsAt: { gte: new Date() },
                isActive: true,
              },
            },
          },
        },
        merchant: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (userRole === UserRole.MERCHANT && product.merchantId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return product;
  }

  async update(id: string, updateData: Partial<CreateProductDto>, userId: string) {
    const product = await this.findOne(id, userId, UserRole.MERCHANT);
    
    return this.prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        prices: true,
        stockItems: true,
      },
    });
  }

  async delete(id: string, userId: string) {
    const product = await this.findOne(id, userId, UserRole.MERCHANT);
    
    return this.prisma.product.delete({
      where: { id },
    });
  }
}