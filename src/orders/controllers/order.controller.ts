import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from '../services/order.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('from-cart/:cartId')
  @ApiOperation({ summary: 'Create order from cart' })
  createFromCart(@Param('cartId') cartId: string, @Request() req) {
    return this.orderService.createFromCart(cartId, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get user orders' })
  findUserOrders(@Request() req) {
    return this.orderService.findUserOrders(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.orderService.findOne(id, req.user.userId);
  }
}