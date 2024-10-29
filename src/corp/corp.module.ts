import { Module } from '@nestjs/common';
import { CorpController } from './corp.controller';
import { CorpService } from './corp.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Corp } from '../entity/corp.entity';
import { Review } from 'src/entity/review.entity';
import { RedisModule } from 'src/redis/redis.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [TypeOrmModule.forFeature([Corp, Review]), RedisModule, ScheduleModule.forRoot()],
  controllers: [CorpController],
  providers: [CorpService],
})
export class CorpModule {}
