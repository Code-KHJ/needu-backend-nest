import { NoticeCommentLike } from 'src/entity/notice-comment-like.entity';
import { NoticeComment } from 'src/entity/notice-comment.entity';

export class NoticeCommentGetResponseDto {
  id: number;
  content: string;
  created_at: Date;
  is_del: boolean;
  blind: number;
  parent_id: number;
  writer: {
    id: number;
    nickname: string;
    // @IsString()
    // user_profile: string; url??

    // @IsString()
    // user_level: string;
  };
  commentLikes: NoticeCommentLike[];

  constructor(comment: NoticeComment) {
    this.id = comment.id;
    this.content = comment.content;
    this.created_at = comment.created_at;
    this.is_del = comment.is_del;
    this.blind = comment.blind;
    this.parent_id = comment.parent_id;
    this.commentLikes = comment.likes;
    this.writer = {
      id: comment.user.id,
      nickname: comment.user.nickname,
      // userProfile: post.user.userProfile, // assuming this property exists in the user object
      // userLevel: post.user.userLevel,     // assuming this property exists in the user object
    };
  }
}
