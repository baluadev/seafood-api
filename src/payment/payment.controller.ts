import { Controller, Post, Body, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Pay2sService } from './pay2s.service';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

import { Public } from '../common/decorators/public.decorator';

@Controller('payment/pay2s')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private pay2sService: Pay2sService,
    private prisma: PrismaService,
  ) {}

  @Public()
  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    this.logger.log(`Nhận Webhook từ Pay2S: ${JSON.stringify(body)}`);

    const { signature, orderCode, amount, transactionId, status } = body;
    const isSandbox = process.env.PAY2S_IS_SANDBOX === 'true';

    if (!signature) {
      throw new UnauthorizedException('Thiếu chữ ký');
    }

    // Sandbox chỉ bỏ qua kiểm tra signature, không bỏ qua toàn bộ flow
    const isValid = this.pay2sService.verifyWebhookSignature(body, signature);
    if (!isValid && !isSandbox) {
      this.logger.error('Chữ ký Webhook không hợp lệ');
      throw new UnauthorizedException('Chữ ký không hợp lệ');
    }

    // orderCode là bắt buộc dù sandbox hay production
    if (!orderCode) {
      throw new BadRequestException('Thiếu orderCode');
    }

    // Xác định thanh toán có thành công không — Pay2S có thể dùng 'success' hoặc 'PAID'
    const isPaid = status === 'success' || status === 'PAID';

    if (!isPaid) {
      this.logger.warn(`Webhook với status không hợp lệ: ${status} — bỏ qua.`);
      return { message: 'Bỏ qua' };
    }

    const order = await this.prisma.order.findUnique({
      where: { orderNumber: orderCode },
    });

    if (!order) {
      this.logger.warn(`Không tìm thấy đơn hàng với orderCode: ${orderCode}`);
      return { message: 'Không tìm thấy đơn hàng' };
    }

    if (order.status !== OrderStatus.PENDING) {
      this.logger.log(`Đơn hàng ${orderCode} đã được xử lý (status: ${order.status}), bỏ qua.`);
      return { message: 'Đã xử lý' };
    }

    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.CONFIRMED,
        transactionId: transactionId || (isSandbox ? 'SANDBOX_TX_ID' : null),
      },
    });

    this.logger.log(`Đã cập nhật trạng thái đơn hàng ${orderCode} thành CONFIRMED`);
    return { message: 'Thành công' };
  }
}
