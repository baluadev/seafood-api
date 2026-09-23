import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto, UpdatePromotionDto } from './dto/promotion.dto';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('promotions')
export class PromotionsController {
  constructor(private promotionsService: PromotionsService) {}

  /** GET /promotions — auth user sees active promotions */
  @Get()
  findAll() {
    return this.promotionsService.findAll();
  }

  /** GET /promotions/admin — admin sees ALL promotions (incl. inactive) */
  @Roles(Role.ADMIN)
  @Get('admin')
  findAllAdmin() {
    return this.promotionsService.findAllAdmin();
  }

  /** POST /promotions — ADMIN only */
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreatePromotionDto) {
    return this.promotionsService.create(dto);
  }

  /** PATCH /promotions/:id — ADMIN only */
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePromotionDto) {
    return this.promotionsService.update(id, dto);
  }

  /** DELETE /promotions/:id — ADMIN only */
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promotionsService.remove(id);
  }
}
