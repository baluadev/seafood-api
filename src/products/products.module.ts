import { Module } from '@nestjs/common';
import { CacheService } from '../common/cache.service';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  controllers: [ProductsController],
  providers: [CacheService, ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
