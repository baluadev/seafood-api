import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  private async getOrCreateCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
            },
          },
          orderBy: { product: { createdAt: 'desc' } },
        },
      },
    });
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
              },
            },
          },
        },
      });
    }
    return cart;
  }

  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    const totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = cart.items.reduce((sum, i) => {
      const price = Number(i.product.price) * (1 - Number(i.product.discountRate));
      return sum + price * i.quantity;
    }, 0);
    return { ...cart, totalItems, totalPrice: Math.round(totalPrice) };
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product || !product.isActive) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }
    if (product.stockQuantity < dto.quantity) {
      throw new BadRequestException('Số lượng vượt quá tồn kho');
    }

    const cart = await this.getOrCreateCart(userId);
    const existingItem = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId: dto.productId } },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + dto.quantity;
      if (product.stockQuantity < newQty) {
        throw new BadRequestException('Số lượng vượt quá tồn kho');
      }
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await this.prisma.cartItem.create({
        data: { cartId: cart.id, productId: dto.productId, quantity: dto.quantity },
      });
    }

    return this.getCart(userId);
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException('Item không tồn tại trong giỏ');

    if (item.product.stockQuantity < dto.quantity) {
      throw new BadRequestException('Số lượng vượt quá tồn kho');
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });
    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException('Item không tồn tại trong giỏ');

    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.getCart(userId);
  }
}
