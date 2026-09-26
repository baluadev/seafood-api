import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cache: any) {}

  /** Clear toàn bộ cache — dùng khi admin CRUD data */
  async clearAll(): Promise<void> {
    try {
      // cache-manager v5: store.reset() hoặc cache.store.reset()
      if (this.cache.store?.reset) {
        await this.cache.store.reset();
      } else if (this.cache.reset) {
        await this.cache.reset();
      } else {
        // Fallback: clear individual keys nếu có store.keys()
        const keys = await this.cache.store?.keys?.();
        if (keys?.length) {
          await Promise.all(keys.map((k: string) => this.cache.del(k)));
        }
      }
      this.logger.log('🗑️  Cache cleared (all entries)');
    } catch (err) {
      this.logger.warn('⚠️  Cache clear failed:', err);
    }
  }
}
