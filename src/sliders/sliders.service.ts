import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../common/cache.service';
import { CreateSliderDto, UpdateSliderDto } from './dto/slider.dto';

@Injectable()
export class SlidersService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  findAll() {
    return this.prisma.slider.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async findOne(id: string) {
    const slider = await this.prisma.slider.findUnique({ where: { id } });
    if (!slider) throw new NotFoundException('Slider không tồn tại');
    return slider;
  }

  async create(dto: CreateSliderDto) {
    const slider = await this.prisma.slider.create({ data: dto });
    await this.cacheService.clearAll();
    return slider;
  }

  async update(id: string, dto: UpdateSliderDto) {
    await this.findOne(id);
    const slider = await this.prisma.slider.update({ where: { id }, data: dto });
    await this.cacheService.clearAll();
    return slider;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.slider.delete({ where: { id } });
    await this.cacheService.clearAll();
    return { message: 'Đã xóa slider' };
  }
}
