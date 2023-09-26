import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from '../entity/review.entity';
import { ReviewController } from './review.controller';
import { Hashtag } from '../entity/hashtag.entity';
import { Corp } from '../entity/corp.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Hashtag, Corp])],
  providers: [ReviewService],
  controllers: [ReviewController],
})
export class ReviewModule {}
