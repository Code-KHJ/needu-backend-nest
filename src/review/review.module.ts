import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from '../entity/review.entity';
import { ReviewController } from './review.controller';
import { Hashtag } from '../entity/hashtag.entity';
import { Corp } from '../entity/corp.entity';
import { CorpService } from 'src/corp/corp.service';
import { UserService } from 'src/user/user.service';
import { UserCareer } from 'src/entity/user-career.entity';
import { User } from 'src/entity/user.entity';
import { ReviewTraning } from 'src/entity/review-training.entity';
import { ReviewLike } from 'src/entity/review-like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, ReviewTraning, ReviewLike, Hashtag, Corp, UserCareer, User])],
  providers: [ReviewService, CorpService, UserService],
  controllers: [ReviewController],
})
export class ReviewModule {}
