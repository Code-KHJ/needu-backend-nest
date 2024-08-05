import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CommunityPost } from './community-post.entity';
import { CommunityComment } from './community-comment.entity';

@Entity({ name: 'community_comment_accepted' })
export class CommunityCommentAccepted {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => CommunityPost, { eager: true })
  @JoinColumn({ name: 'post_id', referencedColumnName: 'id' })
  post: CommunityPost;

  @OneToOne(() => CommunityComment, { eager: true })
  @JoinColumn({ name: 'comment_id', referencedColumnName: 'id' })
  comment: CommunityComment;
}
