import { Module } from '@nestjs/common';
import { SharedService } from './shared.service';
import { SharedController } from './shared.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareerType } from 'src/entity/career-type.entity';
import { ReviewHashtag } from 'src/entity/review-hashtag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CareerType, ReviewHashtag])],
  controllers: [SharedController],
  providers: [SharedService],
})
export class SharedModule {}
