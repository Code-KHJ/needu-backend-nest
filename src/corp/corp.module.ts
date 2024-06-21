import { Module } from '@nestjs/common';
import { CorpController } from './corp.controller';
import { CorpService } from './corp.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Corp } from '../entity/corp.entity';
import { Review } from 'src/entity/review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Corp, Review])],
  controllers: [CorpController],
  providers: [CorpService],
})
export class CorpModule {}
