import { Controller, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe checkout session' })
  createCheckout(@Body('orderId') orderId: string, @Request() req) {
    return this.paymentService.createCheckoutSession(orderId, req.user.userId);
  }

  @Post('refund/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create refund' })
  createRefund(
    @Param('orderId') orderId: string,
    @Body() body: { amount?: number; reason?: string; orderItemIds?: string[] },
    @Request() req
  ) {
    return this.paymentService.createRefund(orderId, req.user.userId, body.amount, body.reason, body.orderItemIds);
  }
}