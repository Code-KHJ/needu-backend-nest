import { Module } from '@nestjs/common';
import { SharedService } from './shared.service';
import { SharedController } from './shared.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareerType } from 'src/entity/career-type.entity';
import { ReviewHashtag } from 'src/entity/review-hashtag.entity';
import { Report } from 'src/entity/report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CareerType, ReviewHashtag, Report])],
  controllers: [SharedController],
  providers: [SharedService],
})
export class SharedModule {}
