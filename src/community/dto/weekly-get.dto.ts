export class WeeklyGetResponseDto {
  id: number;
  title: string;
  content: string;
  created_at: Date;
  blind: number;
  view: number;
  postType: string;
  topicType: string;
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

  constructor(post) {
    this.id = post.id;
    this.title = post.title;
    this.content = post.content;
    this.created_at = post.created_at;
    this.blind = post.blind;
    this.view = post.view;
    this.postType = post.topic.type.type;
    this.topicType = post.topic.topic;
    this.like_cnt = post.likes.length;
    this.comment_cnt = post.comments.filter(comment => !comment.is_del).length;
    this.writer = {
      id: post.user.id,
      nickname: post.user.nickname,
      // userProfile: post.user.userProfile, // assuming this property exists in the user object
      // userLevel: post.user.userLevel,     // assuming this property exists in the user object
    };
  }
}
