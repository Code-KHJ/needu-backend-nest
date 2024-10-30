export class PostCommentGetResponseDto {
  type: string;
  id: number;
  title: string;
  content: string;
  post_type: number;
  created_at: Date;
  view: number;
  like_cnt: number;
  comment_cnt: number;
  wbAccepted: boolean;
  commentAccepted: boolean;
  post: {
    id: number;
    title: string;
    content: string;
    type: string;
  };

  constructor(item) {
    this.type = item.type;
    this.id = item.id;
    this.title = item.title;
    this.content = item.content;
    this.post_type = item.topic?.type.id;
    this.created_at = item.created_at;
    this.view = item.view;
    this.like_cnt = item.likes?.filter(like => like.type === 1).length;
    this.comment_cnt = item.comments?.filter(comment => !comment.is_del).length;
    this.wbAccepted = item.wb && !item.wb.is_del ? true : false;
    this.commentAccepted = item.accepted ? true : false;
    this.post = {
      id: item.post?.id,
      title: item.post?.title,
      content: item.post?.content,
      type: item.post?.topic_id < 5 ? '자유게시판' : '질문&답변',
    };
  }
}
