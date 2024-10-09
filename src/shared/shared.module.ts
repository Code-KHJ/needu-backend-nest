import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareerType } from 'src/entity/career-type.entity';
import { Report } from 'src/entity/report.entity';
import { ReviewHashtag } from 'src/entity/review-hashtag.entity';
import { UtilService } from 'src/util/util.service';
import { SharedController } from './shared.controller';
import { SharedService } from './shared.service';

@Module({
  imports: [TypeOrmModule.forFeature([CareerType, ReviewHashtag, Report])],
  controllers: [SharedController],
  providers: [SharedService, UtilService],
})
export class SharedModule {}
