import { Module } from '@nestjs/common';
import { Redis } from 'ioredis';

@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const client = new Redis({
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT, 10),
        });

        client.on('connect', () => {
          console.log('Connected to Redis');
        });

        // Redis 클라이언트 오류 처리
        client.on('error', err => {
          console.error('Redis Error:', err);
        });

        return client;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
