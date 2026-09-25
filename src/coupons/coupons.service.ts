import {
  Injectable, NotFoundException, BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CouponType } from '@prisma/client';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto } from './dto/coupon.dto';

export interface CouponValidationResult {
  valid: boolean;
  coupon?: any;
  discountAmount?: number;
  shippingFree?: boolean;
  finalAmount?: number;
  savings?: string;
  message?: string;
}

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  // ─── Admin CRUD ───────────────────────────────────────────────────────────

  async findAll() {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { usages: true } } },
    });
  }

  async findOne(id: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
      include: {
        usages: {
          include: { user: { select: { id: true, fullName: true, email: true } } },
          orderBy: { usedAt: 'desc' },
          take: 50,
        },
      },
    });
    if (!coupon) throw new NotFoundException('Coupon không tồn tại');
    return coupon;
  }

  async create(dto: CreateCouponDto) {
    const code = dto.code.toUpperCase().trim();
    const existing = await this.prisma.coupon.findUnique({ where: { code } });
    if (existing) throw new ConflictException(`Mã "${code}" đã tồn tại`);

    return this.prisma.coupon.create({
      data: {
        ...dto,
        code,
        value: dto.value,
        minOrderAmt: dto.minOrderAmt ?? undefined,
        maxDiscount: dto.maxDiscount ?? undefined,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async update(id: string, dto: UpdateCouponDto) {
    await this.findOne(id);
    return this.prisma.coupon.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.coupon.delete({ where: { id } });
  }

  // ─── User: Validate ───────────────────────────────────────────────────────

  async validate(userId: string, dto: ValidateCouponDto): Promise<CouponValidationResult> {
    const code = dto.code.toUpperCase().trim();
    const orderAmount = dto.orderAmount;

    const coupon = await this.prisma.coupon.findUnique({ where: { code } });

    if (!coupon || !coupon.isActive) {
      return { valid: false, message: 'Mã khuyến mãi không tồn tại hoặc đã bị vô hiệu hóa' };
    }

    const now = new Date();
    if (coupon.startDate && coupon.startDate > now) {
      return { valid: false, message: 'Mã khuyến mãi chưa đến ngày áp dụng' };
    }
    if (coupon.endDate && coupon.endDate < now) {
      return { valid: false, message: 'Mã khuyến mãi đã hết hạn' };
    }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, message: 'Mã khuyến mãi đã hết lượt sử dụng' };
    }
    if (coupon.minOrderAmt && orderAmount < Number(coupon.minOrderAmt)) {
      return {
        valid: false,
        message: `Đơn hàng tối thiểu ${Number(coupon.minOrderAmt).toLocaleString('vi-VN')}₫ để dùng mã này`,
      };
    }

    // Check per-user limit
    const userUsageCount = await this.prisma.couponUsage.count({
      where: { couponId: coupon.id, userId },
    });
    if (userUsageCount >= coupon.perUserLimit) {
      return { valid: false, message: `Bạn đã dùng mã này ${coupon.perUserLimit} lần (tối đa cho phép)` };
    }

    // Calculate discount
    let discountAmount = 0;
    let shippingFree = false;

    if (coupon.type === CouponType.FIXED_AMOUNT) {
      discountAmount = Math.min(Number(coupon.value), orderAmount);
    } else if (coupon.type === CouponType.PERCENT) {
      discountAmount = Math.round(orderAmount * Number(coupon.value) / 100);
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, Number(coupon.maxDiscount));
      }
    } else if (coupon.type === CouponType.FREE_SHIPPING) {
      shippingFree = true;
      discountAmount = 0; // shipping handled by FE
    }

    const finalAmount = Math.max(0, orderAmount - discountAmount);
    const savingsText = shippingFree
      ? 'Miễn phí vận chuyển'
      : `Bạn tiết kiệm ${discountAmount.toLocaleString('vi-VN')}₫`;

    return {
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: Number(coupon.value),
        description: coupon.description,
      },
      discountAmount,
      shippingFree,
      finalAmount,
      savings: savingsText,
    };
  }

  /** Gợi ý 3 mã phù hợp với orderAmount của user */
  async getSuggestions(userId: string, orderAmount: number) {
    const now = new Date();
    const coupons = await this.prisma.coupon.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: now } }] },
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
          { OR: [{ minOrderAmt: null }, { minOrderAmt: { lte: orderAmount } }] },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Filter out coupons user has maxed out
    const suggestions: any[] = [];
    for (const c of coupons) {
      const userCount = await this.prisma.couponUsage.count({
        where: { couponId: c.id, userId },
      });
      if (userCount < c.perUserLimit) {
        let label = c.code;
        if (c.type === CouponType.FIXED_AMOUNT) {
          label = `${c.code} -${Number(c.value).toLocaleString('vi-VN')}đ`;
        } else if (c.type === CouponType.PERCENT) {
          label = `${c.code} -${Number(c.value)}%`;
        } else if (c.type === CouponType.FREE_SHIPPING) {
          label = `${c.code} FREESHIP`;
        }
        suggestions.push({
          code: c.code, label, type: c.type,
          value: Number(c.value), description: c.description,
        });
        if (suggestions.length >= 3) break;
      }
    }
    return suggestions;
  }

  // ─── Internal: dùng bởi OrdersService ────────────────────────────────────

  async applyCouponToOrder(
    couponId: string,
    userId: string,
    orderId: string,
  ) {
    // Tăng usageCount và tạo usage record
    await this.prisma.$transaction([
      this.prisma.coupon.update({
        where: { id: couponId },
        data: { usageCount: { increment: 1 } },
      }),
      this.prisma.couponUsage.create({
        data: { couponId, userId, orderId },
      }),
    ]);
  }
}
