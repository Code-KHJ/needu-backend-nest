import { OmitType, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { CommunityPostLike } from 'src/entity/community-post-like.entity';
import { CommunityPost } from 'src/entity/community-post.entity';

export class PostGetResponseDto {
  id: number;
  title: string;
  content: string;
  created_at: Date;
  is_del: boolean;
  blind: number;
  view: number;
  postType: string;
  topicType: string;
  commentAccepted: number | null;
  writer: {
    id: number;
    nickname: string;
    // @IsString()
    // user_profile: string; url??

    // @IsString()
    // user_level: string;
  };
  postLikes: CommunityPostLike[];
  comment_cnt: number;

  constructor(post: CommunityPost) {
    this.id = post.id;
    this.title = post.title;
    this.content = post.content;
    this.created_at = post.created_at;
    this.is_del = post.is_del;
    this.blind = post.blind;
    this.view = post.view;
    this.postType = post.topic.type.type;
    this.topicType = post.topic.topic;
    this.commentAccepted = post.comment_accepted?.comment.id;
    this.postLikes = post.likes;
    this.comment_cnt = post.comments.filter(comment => !comment.is_del).length;
    this.writer = {
      id: post.user.id,
      nickname: post.user.nickname,
      // userProfile: post.user.userProfile, // assuming this property exists in the user object
      // userLevel: post.user.userLevel,     // assuming this property exists in the user object
    };
  }
}

export class PostsGetDto {
  @IsOptional()
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  topic: string;

  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsString()
  order: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page: number;
}

export class PostsGetResponseDto {
  id: number;
  title: string;
  content: string;
  created_at: Date;
  blind: number;
  view: number;
  postType: string;
  topicType: string;
  commentAccepted: number | null;
  writer: {
    id: number;
    nickname: string;
    // @IsString()
    // user_profile: string; url??

    // @IsString()
    // user_level: string;
  };
  like_cnt: number;
  comment_cnt: number;
  wbAccepted: boolean;

  constructor(post) {
    this.id = post.p_id;
    this.title = post.p_title;
    this.content = post.p_content;
    this.created_at = post.p_created_at;
    this.blind = post.p_blind;
    this.view = post.p_view;
    this.postType = post.t_type_id;
    this.topicType = post.t_id;
    this.commentAccepted = post.a_comment_id;
    this.like_cnt = post.like_cnt;
    this.comment_cnt = post.comment_cnt;
    this.wbAccepted = post.wb ? true : false;
    this.writer = {
      id: post.u_id,
      nickname: post.u_nickname,
      // userProfile: post.user.userProfile, // assuming this property exists in the user object
      // userLevel: post.user.userLevel,     // assuming this property exists in the user object
    };
  }
}
