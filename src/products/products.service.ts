import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ProductQueryDto) {
    const { page = 1, limit = 12, categoryId, search, sort, isHot, minPrice, maxPrice } = query;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };
    if (categoryId) where.categoryId = categoryId;
    if (isHot === 'true') where.isHot = true;
    if (search) where.title = { contains: search, mode: 'insensitive' };
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'rating') orderBy = { avgRating: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { category: true, images: { orderBy: { sortOrder: 'asc' } } },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
    return product;
  }

  async create(dto: CreateProductDto) {
    const existing = await this.prisma.product.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) throw new ConflictException('Slug đã tồn tại');
    return this.prisma.product.create({
      data: { ...dto, price: dto.price, discountRate: dto.discountRate ?? 0 },
      include: { category: true },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    if (dto.slug) {
      const conflict = await this.prisma.product.findFirst({
        where: { slug: dto.slug, NOT: { id } },
      });
      if (conflict) throw new ConflictException('Slug đã tồn tại');
    }
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: { category: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }
}
