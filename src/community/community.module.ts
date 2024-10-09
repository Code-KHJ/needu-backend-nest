import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityCommentLike } from 'src/entity/community-comment-like.entity';
import { CommunityComment } from 'src/entity/community-comment.entity';
import { CommunityPostLike } from 'src/entity/community-post-like.entity';
import { CommunityPost } from 'src/entity/community-post.entity';
import { CommunityTopic } from 'src/entity/community-topic.entity';
import { CommunityType } from 'src/entity/community-type.entity';
import { CommunityWeeklyBest } from 'src/entity/community-weekly-best.entity';
import { User } from 'src/entity/user.entity';
import { multerOptionsFactory } from 'src/multer.options.factory';
import { UtilService } from 'src/util/util.service';
import { CommunityCommentAccepted } from './../entity/community_comment_accepted.entity';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';

@Module({
  imports: [
    MulterModule.registerAsync({ imports: [ConfigModule], useFactory: multerOptionsFactory }),
    TypeOrmModule.forFeature([
      CommunityPost,
      CommunityPostLike,
      CommunityComment,
      CommunityCommentLike,
      CommunityCommentAccepted,
      CommunityType,
      CommunityTopic,
      CommunityWeeklyBest,
      User,
    ]),
  ],
  controllers: [CommunityController],
  providers: [CommunityService, UtilService],
})
export class CommunityModule {}
