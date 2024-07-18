import { CommunityCommentAccepted } from './../entity/community_comment_accepted.entity';
import { Module } from '@nestjs/common';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityPost } from 'src/entity/community-post.entity';
import { CommunityPostLike } from 'src/entity/community-post-like.entity';
import { CommunityComment } from 'src/entity/community-comment.entity';
import { CommunityCommentLike } from 'src/entity/community-comment-like.entity';
import { CommunityType } from 'src/entity/community-type.entity';
import { CommunityTopic } from 'src/entity/community-topic.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommunityPost,
      CommunityPostLike,
      CommunityComment,
      CommunityCommentLike,
      CommunityCommentAccepted,
      CommunityType,
      CommunityTopic,
    ]),
  ],
  controllers: [CommunityController],
  providers: [CommunityService],
})
export class CommunityModule {}
