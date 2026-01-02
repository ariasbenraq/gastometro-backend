import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheHealthIndicator extends HealthIndicator {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const testKey = 'health_check';
    const testValue = Date.now().toString();

    try {
      await this.cache.set(testKey, testValue, 5_000);
      const cachedValue = await this.cache.get<string>(testKey);
      const isHealthy = cachedValue === testValue;

      if (!isHealthy) {
        throw new Error('cache mismatch');
      }

      return this.getStatus(key, true);
    } catch (error) {
      throw new HealthCheckError(
        'Cache check failed',
        this.getStatus(key, false, { message: (error as Error).message }),
      );
    }
  }
}
