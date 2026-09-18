import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(activeOnly = true) {
    return this.prisma.category.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Danh mục không tồn tại');
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) throw new ConflictException('Slug đã tồn tại');

    return this.prisma.category.create({ data: dto });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);
    if (dto.slug) {
      const conflict = await this.prisma.category.findFirst({
        where: { slug: dto.slug, NOT: { id } },
      });
      if (conflict) throw new ConflictException('Slug đã tồn tại');
    }
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.category.delete({ where: { id } });
  }
}
