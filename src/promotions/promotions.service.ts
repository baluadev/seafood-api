import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../common/cache.service';
import { CreatePromotionDto, UpdatePromotionDto } from './dto/promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  findAll() {
    return this.prisma.promotion.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  findAllAdmin() {
    return this.prisma.promotion.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async findOne(id: string) {
    const promo = await this.prisma.promotion.findUnique({ where: { id } });
    if (!promo) throw new NotFoundException('Promotion không tồn tại');
    return promo;
  }

  async create(dto: CreatePromotionDto) {
    const promo = await this.prisma.promotion.create({ data: dto });
    await this.cacheService.clearAll();
    return promo;
  }

  async update(id: string, dto: UpdatePromotionDto) {
    await this.findOne(id);
    const promo = await this.prisma.promotion.update({ where: { id }, data: dto });
    await this.cacheService.clearAll();
    return promo;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.promotion.delete({ where: { id } });
    await this.cacheService.clearAll();
    return { message: 'Đã xóa promotion' };
  }
}
