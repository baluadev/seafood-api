import { Module } from '@nestjs/common';
import { CacheService } from '../common/cache.service';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  controllers: [ReviewsController],
  providers: [CacheService, ReviewsService],
})
export class ReviewsModule {}
