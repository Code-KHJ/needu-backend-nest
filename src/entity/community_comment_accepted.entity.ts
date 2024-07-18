import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CommunityPost } from './community-post.entity';
import { CommunityComment } from './community-comment.entity';

@Entity({ name: 'community_comment_accepted' })
export class CommunityCommentAccepted {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => CommunityPost)
  @JoinColumn({ name: 'port_id', referencedColumnName: 'id' })
  post: CommunityPost;

  @OneToOne(() => CommunityComment)
  @JoinColumn({ name: 'comment_id', referencedColumnName: 'id' })
  comment: CommunityComment;
}
