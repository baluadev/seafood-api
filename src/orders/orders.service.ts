import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { OrderStatus } from '@prisma/client';
import { Pay2sService } from '../payment/pay2s.service';

// Bank info for VietQR (configure via env in production)
const BANK_ID = process.env.BANK_ID || 'VCB'; // Vietcombank
const ACCOUNT_NUMBER = process.env.BANK_ACCOUNT_NUMBER || '1234567890';
const ACCOUNT_NAME = process.env.BANK_ACCOUNT_NAME || 'CONG TY HAI SAN SEASHOP';
const SHIPPING_FEE = 30000; // 30,000đ flat fee

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
    private pay2sService: Pay2sService,
  ) {}

  private generateOrderNumber(): string {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(Math.random() * 9000) + 1000;
    return `SEA-${date}-${rand}`;
  }



  async createOrder(userId: string, dto: CreateOrderDto) {
    const cart = await this.cartService.getCart(userId);
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Giỏ hàng trống');
    }

    const subtotal = cart.totalPrice;
    const totalAmount = subtotal + SHIPPING_FEE;
    const orderNumber = this.generateOrderNumber();

    const order = await this.prisma.order.create({
      data: {
        userId,
        orderNumber,
        subtotal,
        shippingFee: SHIPPING_FEE,
        totalAmount,
        note: dto.note,
        shippingAddress: {
          create: dto.shippingAddress,
        },
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: Math.round(
              Number(item.product.price) * (1 - Number(item.product.discountRate)),
            ),
            subtotal: Math.round(
              Number(item.product.price) *
                (1 - Number(item.product.discountRate)) *
                item.quantity,
            ),
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        shippingAddress: true,
      },
    });

    // Clear cart after order placed
    await this.cartService.clearCart(userId);

    // Call Pay2s to get payment URL
    const paymentUrl = await this.pay2sService.createPaymentLink(
      orderNumber,
      totalAmount,
    );

    if (paymentUrl) {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { paymentUrl },
      });
      order.paymentUrl = paymentUrl;
    }

    return { order, paymentUrl };
  }

  async getMyOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: true } },
        shippingAddress: true,
      },
    });
  }

  async getOrderById(id: string, userId?: string) {
    const where: any = { id };
    if (userId) where.userId = userId;

    const order = await this.prisma.order.findFirst({
      where,
      include: {
        items: { include: { product: true } },
        shippingAddress: true,
      },
    });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    return { order, paymentUrl: order.paymentUrl };
  }

  // Admin: get all orders
  async getAllOrders(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, fullName: true } },
          shippingAddress: true,
          items: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  // Admin: update order status
  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    return this.prisma.order.update({
      where: { id },
      data: { status: dto.status as OrderStatus },
    });
  }

  // Customer: tạo lại payment URL cho đơn PENDING
  async regeneratePaymentUrl(id: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
    });

    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Chỉ có thể tạo lại link thanh toán cho đơn hàng đang chờ');
    }

    const paymentUrl = await this.pay2sService.createPaymentLink(
      order.orderNumber,
      Number(order.totalAmount),
    );

    if (!paymentUrl) {
      throw new BadRequestException('Không thể tạo link thanh toán, vui lòng thử lại');
    }

    await this.prisma.order.update({
      where: { id },
      data: { paymentUrl },
    });

    return { paymentUrl };
  }
}

