import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from '../services/cart.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new cart' })
  create(@Request() req) {
    return this.cartService.createCart(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cart by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.cartService.getCart(id, req.user.userId);
  }

  @Post(':id/items')
  @ApiOperation({ summary: 'Add item to cart' })
  addItem(
    @Param('id') cartId: string,
    @Body() body: { productId: string; priceId: string; quantity?: number; slotId?: string },
    @Request() req
  ) {
    return this.cartService.addItem(
      cartId,
      req.user.userId,
      body.productId,
      body.priceId,
      body.quantity,
      body.slotId
    );
  }

  @Delete(':cartId/items/:itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  removeItem(@Param('cartId') cartId: string, @Param('itemId') itemId: string, @Request() req) {
    return this.cartService.removeItem(cartId, req.user.userId, itemId);
  }

  @Get(':id/total')
  @ApiOperation({ summary: 'Calculate cart total' })
  calculateTotal(@Param('id') cartId: string, @Request() req) {
    return this.cartService.calculateTotal(cartId, req.user.userId);
  }
}