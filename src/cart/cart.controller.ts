import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: any) {
    return this.cartService.getCart(user.sub);
  }

  @Post('items')
  addItem(@CurrentUser() user: any, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(user.sub, dto);
  }

  @Patch('items/:itemId')
  updateItem(
    @CurrentUser() user: any,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(user.sub, itemId, dto);
  }

  @Delete('items/:itemId')
  removeItem(@CurrentUser() user: any, @Param('itemId') itemId: string) {
    return this.cartService.removeItem(user.sub, itemId);
  }

  @Delete()
  clearCart(@CurrentUser() user: any) {
    return this.cartService.clearCart(user.sub);
  }
}
