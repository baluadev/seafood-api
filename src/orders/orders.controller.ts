import {
  Controller, Get, Post, Patch, Body, Param, Query,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  // Customer: place order from cart
  @Post()
  createOrder(@CurrentUser() user: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(user.sub, dto);
  }

  // Customer: my orders
  @Get()
  getMyOrders(@CurrentUser() user: any) {
    return this.ordersService.getMyOrders(user.sub);
  }

  // Admin: all orders — phải đặt TRƯỚC @Get(':id') để tránh NestJS match 'admin' như là id
  @Roles(Role.ADMIN)
  @Get('admin/all')
  getAllOrders(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.ordersService.getAllOrders(
      page ? +page : 1,
      limit ? +limit : 20,
      status,
    );
  }

  // Admin: update status — phải đặt TRƯỚC @Get(':id')
  @Roles(Role.ADMIN)
  @Patch('admin/:id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }

  // Customer: repay — tạo lại paymentUrl mới cho đơn PENDING
  @Post(':id/repay')
  repay(@CurrentUser() user: any, @Param('id') id: string) {
    return this.ordersService.regeneratePaymentUrl(id, user.sub);
  }

  // Customer/Admin: order detail — phải đặt SAU các route cụ thể bên trên
  @Get(':id')
  getOrderById(@CurrentUser() user: any, @Param('id') id: string) {
    const isAdmin = user.role === Role.ADMIN;
    return this.ordersService.getOrderById(id, isAdmin ? undefined : user.sub);
  }
}

