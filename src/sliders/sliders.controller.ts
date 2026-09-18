import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { Role } from '@prisma/client';
import { SlidersService } from './sliders.service';
import { CreateSliderDto, UpdateSliderDto } from './dto/slider.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('sliders')
export class SlidersController {
  constructor(private slidersService: SlidersService) {}

  @Public()
  @Get()
  findAll() {
    return this.slidersService.findAll();
  }

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateSliderDto) {
    return this.slidersService.create(dto);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSliderDto) {
    return this.slidersService.update(id, dto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.slidersService.remove(id);
  }
}
