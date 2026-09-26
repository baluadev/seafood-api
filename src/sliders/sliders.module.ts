import { Module } from '@nestjs/common';
import { CacheService } from '../common/cache.service';
import { SlidersController } from './sliders.controller';
import { SlidersService } from './sliders.service';

@Module({
  controllers: [SlidersController],
  providers: [CacheService, SlidersService],
})
export class SlidersModule {}
