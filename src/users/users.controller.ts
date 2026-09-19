import {
  Controller, Get, Patch, Param, Query,
  NotFoundException, BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('users')
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('admin')
  getAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.usersService.getAll({ page: Number(page), limit: Number(limit), search });
  }

  @Get('admin/:id')
  async getOne(@Param('id') id: string) {
    const result = await this.usersService.getOne(id);
    if (!result) throw new NotFoundException('Không tìm thấy người dùng');
    return result;
  }

  @Patch('admin/:id/toggle-active')
  async toggleActive(@Param('id') id: string) {
    const result = await this.usersService.toggleActive(id);
    if (!result) throw new NotFoundException('Không tìm thấy người dùng');
    if ((result as any).error) throw new BadRequestException((result as any).error);
    return result;
  }
}
