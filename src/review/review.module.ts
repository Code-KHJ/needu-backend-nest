import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorpService } from 'src/corp/corp.service';
import { ReviewLike } from 'src/entity/review-like.entity';
import { ReviewTrainingLike } from 'src/entity/review-training-like.entity';
import { ReviewTraning } from 'src/entity/review-training.entity';
import { UserCareer } from 'src/entity/user-career.entity';
import { User } from 'src/entity/user.entity';
import { UserService } from 'src/user/user.service';
import { UtilService } from 'src/util/util.service';
import { Corp } from '../entity/corp.entity';
import { Hashtag } from '../entity/hashtag.entity';
import { Review } from '../entity/review.entity';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';

@Module({
  imports: [TypeOrmModule.forFeature([Review, ReviewTraning, ReviewLike, ReviewTrainingLike, Hashtag, Corp, UserCareer, User])],
  providers: [ReviewService, CorpService, UserService, UtilService],
  controllers: [ReviewController],
})
export class ReviewModule {}
