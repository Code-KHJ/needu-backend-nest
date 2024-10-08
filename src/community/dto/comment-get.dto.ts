import { CommunityCommentLike } from 'src/entity/community-comment-like.entity';
import { CommunityComment } from 'src/entity/community-comment.entity';

export class CommentGetResponseDto {
  id: number;
  content: string;
  created_at: Date;
  is_del: boolean;
  blind: number;
  parent_id: number;
  writer: {
    id: number;
    nickname: string;
    profile_image: string | null;
    activity_points: number;
  };
  commentLikes: CommunityCommentLike[];

  constructor(comment: CommunityComment) {
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
      profile_image: comment.user.profile_image,
      activity_points: comment.user.activity_points,
    };
  }
}
