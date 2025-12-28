import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import type { RedisClientOptions } from 'redis';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync<RedisClientOptions>({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        console.log('Connecting to Redis:', redisUrl);

        if (redisUrl) {
          return {
            store: redisStore as unknown,
            url: redisUrl,
            ttl: 60 * 60,
          };
        }

        const host = configService.get<string>('REDIS_HOST') || 'localhost';
        const port = Number(configService.get<string>('REDIS_PORT') || 6380);
        const password = configService.get<string>('REDIS_PASSWORD') || undefined;

        console.log('Fallback Redis config:', { host, port, password });

        return {
          store: redisStore as unknown,
          host,
          port,
          password,
          ttl: 60 * 60,
        };
      },
      isGlobal: true,
    }),
  ],
  exports: [CacheModule],
})
export class RedisModule {}
