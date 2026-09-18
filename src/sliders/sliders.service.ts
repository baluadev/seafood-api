import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSliderDto, UpdateSliderDto } from './dto/slider.dto';

@Injectable()
export class SlidersService {
  constructor(private prisma: PrismaService) {}

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

  create(dto: CreateSliderDto) {
    return this.prisma.slider.create({ data: dto });
  }

  async update(id: string, dto: UpdateSliderDto) {
    await this.findOne(id);
    return this.prisma.slider.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.slider.delete({ where: { id } });
  }
}
