import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareerType } from 'src/entity/career-type.entity';
import { Report } from 'src/entity/report.entity';
import { ReviewHashtag } from 'src/entity/review-hashtag.entity';
import { UtilService } from 'src/util/util.service';
import { SharedController } from './shared.controller';
import { SharedService } from './shared.service';
import { ActivityType } from 'src/entity/activity-type.entity';
import { ActivityLog } from 'src/entity/activity-log.entity';
import { User } from 'src/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CareerType, ReviewHashtag, Report, ActivityType, ActivityLog, User])],
  controllers: [SharedController],
  providers: [SharedService, UtilService],
  exports: [TypeOrmModule, SharedService],
})
export class SharedModule {}
