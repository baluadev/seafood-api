import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  /** Lấy toàn bộ wishlist của user kèm thông tin product */
  async findAll(userId: string) {
    const items = await this.prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            discountRate: true,
            thumbnailUrl: true,
            unit: true,
            isActive: true,
            isHot: true,
            stockQuantity: true,
            avgRating: true,
            reviewCount: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { items, total: items.length };
  }

  /** Kiểm tra 1 sản phẩm có trong wishlist không */
  async check(userId: string, productId: string) {
    const item = await this.prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    return { isWishlisted: !!item };
  }

  /** Thêm sản phẩm vào wishlist */
  async add(userId: string, productId: string) {
    // Kiểm tra product tồn tại
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');

    try {
      await this.prisma.wishlist.create({ data: { userId, productId } });
      return { message: 'Đã thêm vào yêu thích', isWishlisted: true };
    } catch (e) {
      // P2002 = unique constraint violation (đã tồn tại)
      if (e?.code === 'P2002') {
        throw new ConflictException('Sản phẩm đã có trong danh sách yêu thích');
      }
      throw e;
    }
  }

  /** Xóa sản phẩm khỏi wishlist */
  async remove(userId: string, productId: string) {
    const item = await this.prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (!item) throw new NotFoundException('Sản phẩm không có trong danh sách yêu thích');

    await this.prisma.wishlist.delete({
      where: { userId_productId: { userId, productId } },
    });
    return { message: 'Đã bỏ yêu thích', isWishlisted: false };
  }

  /** Toggle: thêm nếu chưa có, xóa nếu đã có */
  async toggle(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');

    const existing = await this.prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      await this.prisma.wishlist.delete({
        where: { userId_productId: { userId, productId } },
      });
      return { message: 'Đã bỏ yêu thích', isWishlisted: false };
    } else {
      await this.prisma.wishlist.create({ data: { userId, productId } });
      return { message: 'Đã thêm vào yêu thích', isWishlisted: true };
    }
  }

  /** Admin: thống kê top sản phẩm được yêu thích nhiều nhất */
  async getAdminStats() {
    const topProducts = await this.prisma.wishlist.groupBy({
      by: ['productId'],
      _count: { productId: true },
      orderBy: { _count: { productId: 'desc' } },
      take: 10,
    });

    const total = await this.prisma.wishlist.count();

    const productIds = topProducts.map((p) => p.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, title: true, thumbnailUrl: true, price: true },
    });

    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

    return {
      total,
      topProducts: topProducts.map((t) => ({
        product: productMap[t.productId],
        wishlistCount: t._count.productId,
      })),
    };
  }
}
