import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromotionDto, UpdatePromotionDto } from './dto/promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) {}

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

  create(dto: CreatePromotionDto) {
    return this.prisma.promotion.create({ data: dto });
  }

  async update(id: string, dto: UpdatePromotionDto) {
    await this.findOne(id);
    return this.prisma.promotion.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.promotion.delete({ where: { id } });
  }
}
