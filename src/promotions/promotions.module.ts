import { Module } from '@nestjs/common';
import { CacheService } from '../common/cache.service';
import { PromotionsController } from './promotions.controller';
import { PromotionsService } from './promotions.service';

@Module({
  controllers: [PromotionsController],
  providers: [CacheService, PromotionsService],
  exports: [PromotionsService],
})
export class PromotionsModule {}
