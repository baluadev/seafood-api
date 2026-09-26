import { Module } from '@nestjs/common';
import { CacheService } from '../common/cache.service';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

@Module({
  controllers: [CategoriesController],
  providers: [CacheService, CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
