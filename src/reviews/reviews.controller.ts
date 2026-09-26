import { Body, Controller, Delete, Get, Param, Post, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300) // 5 phút
  @Get('product/:slug')
  getByProduct(@Param('slug') slug: string) {
    return this.reviewsService.getByProduct(slug);
  }

  @Post('product/:productId')
  create(
    @Param('productId') productId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(productId, user.sub, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.reviewsService.delete(id, user.sub, user.role);
  }
}
