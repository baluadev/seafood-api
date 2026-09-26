import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../common/cache.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  async getByProduct(productSlug: string) {
    const product = await this.prisma.product.findUnique({ where: { slug: productSlug } });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');

    const reviews = await this.prisma.review.findMany({
      where: { productId: product.id },
      include: { user: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const total = reviews.length;
    const avgRating = total > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
    const distribution = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: reviews.filter((r) => r.rating === star).length,
    }));

    return { reviews, total, avgRating: Math.round(avgRating * 10) / 10, distribution };
  }

  async create(productId: string, userId: string, dto: CreateReviewDto) {
    // Kiểm tra user đã mua sản phẩm này chưa
    const hasPurchased = await this.prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId, status: { in: ['COMPLETED', 'SHIPPING'] } },
      },
    });
    if (!hasPurchased) {
      throw new ForbiddenException('Bạn cần mua sản phẩm trước khi đánh giá');
    }

    // Kiểm tra đã đánh giá chưa
    const existing = await this.prisma.review.findFirst({ where: { productId, userId } });
    if (existing) throw new BadRequestException('Bạn đã đánh giá sản phẩm này rồi');

    const review = await this.prisma.review.create({
      data: { productId, userId, rating: dto.rating, comment: dto.comment },
      include: { user: { select: { id: true, fullName: true } } },
    });

    // Cập nhật avgRating và reviewCount trong product
    await this._updateProductRating(productId);
    await this.cacheService.clearAll();

    return review;
  }

  async delete(reviewId: string, userId: string, userRole: string) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Đánh giá không tồn tại');
    if (review.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Bạn không có quyền xóa đánh giá này');
    }
    await this.prisma.review.delete({ where: { id: reviewId } });
    await this._updateProductRating(review.productId);
    await this.cacheService.clearAll();
    return { message: 'Đã xóa đánh giá' };
  }

  private async _updateProductRating(productId: string) {
    const all = await this.prisma.review.findMany({ where: { productId }, select: { rating: true } });
    const count = all.length;
    const avg = count > 0 ? all.reduce((s, r) => s + r.rating, 0) / count : 0;
    await this.prisma.product.update({
      where: { id: productId },
      data: { avgRating: Math.round(avg * 10) / 10, reviewCount: count },
    });
  }
}
