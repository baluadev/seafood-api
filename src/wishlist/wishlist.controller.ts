import { Controller, Get, Post, Delete, Param, Req } from '@nestjs/common';
import type { Request } from 'express';
import { Role } from '@prisma/client';
import { WishlistService } from './wishlist.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('wishlist')
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  /** GET /wishlist — lấy toàn bộ wishlist của user hiện tại */
  @Get()
  findAll(@Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.wishlistService.findAll(userId);
  }

  /** GET /wishlist/check/:productId — kiểm tra sản phẩm có được yêu thích chưa */
  @Get('check/:productId')
  check(@Req() req: Request, @Param('productId') productId: string) {
    const userId = (req as any).user.sub;
    return this.wishlistService.check(userId, productId);
  }

  /** GET /wishlist/admin/stats — (Admin) thống kê top yêu thích */
  @Roles(Role.ADMIN)
  @Get('admin/stats')
  getAdminStats() {
    return this.wishlistService.getAdminStats();
  }

  /** POST /wishlist/:productId/toggle — thêm hoặc xóa khỏi wishlist */
  @Post(':productId/toggle')
  toggle(@Req() req: Request, @Param('productId') productId: string) {
    const userId = (req as any).user.sub;
    return this.wishlistService.toggle(userId, productId);
  }

  /** POST /wishlist/:productId — thêm vào wishlist */
  @Post(':productId')
  add(@Req() req: Request, @Param('productId') productId: string) {
    const userId = (req as any).user.sub;
    return this.wishlistService.add(userId, productId);
  }

  /** DELETE /wishlist/:productId — bỏ khỏi wishlist */
  @Delete(':productId')
  remove(@Req() req: Request, @Param('productId') productId: string) {
    const userId = (req as any).user.sub;
    return this.wishlistService.remove(userId, productId);
  }
}
