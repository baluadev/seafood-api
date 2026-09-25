import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { Role } from '@prisma/client';
import { CouponsService } from './coupons.service';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto } from './dto/coupon.dto';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('coupons')
export class CouponsController {
  constructor(private couponsService: CouponsService) {}

  /** POST /coupons/validate — JWT User: kiểm tra + tính discount */
  @Post('validate')
  validate(@Req() req: Request, @Body() dto: ValidateCouponDto) {
    const userId = (req as any).user.sub;
    return this.couponsService.validate(userId, dto);
  }

  /** GET /coupons/suggestions?orderAmount=xxx — JWT User: gợi ý mã */
  @Get('suggestions')
  getSuggestions(
    @Req() req: Request,
    @Query('orderAmount') orderAmount: string,
  ) {
    const userId = (req as any).user.sub;
    return this.couponsService.getSuggestions(userId, Number(orderAmount) || 0);
  }

  /** GET /coupons — ADMIN only */
  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.couponsService.findAll();
  }

  /** GET /coupons/:id — ADMIN only */
  @Roles(Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.couponsService.findOne(id);
  }

  /** POST /coupons — ADMIN only */
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateCouponDto) {
    return this.couponsService.create(dto);
  }

  /** PATCH /coupons/:id — ADMIN only */
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.couponsService.update(id, dto);
  }

  /** DELETE /coupons/:id — ADMIN only */
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }
}
