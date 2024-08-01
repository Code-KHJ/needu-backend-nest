import { NoticeLike } from 'src/entity/notice-like.entity';
import { Notice } from 'src/entity/notice.entity';

export class NoticeGetResponseDto {
  id: number;
  title: string;
  content: string;
  created_at: Date;
  view: number;
  is_del: boolean;
  writer: {
    id: number;
    nickname: string;
    // @IsString()
    // user_profile: string; url??

    // @IsString()
    // user_level: string;
  };
  noticeLikes: NoticeLike[];

  constructor(notice: Notice) {
    this.id = notice.id;
    this.title = notice.title;
    this.content = notice.content;
    this.created_at = notice.created_at;
    this.view = notice.view;
    this.is_del = notice.is_del;
    this.writer = {
      id: notice.user.id,
      nickname: notice.user.nickname,
      // userProfile: post.user.userProfile, // assuming this property exists in the user object
      // userLevel: post.user.userLevel,     // assuming this property exists in the user object
    };
  }
}
