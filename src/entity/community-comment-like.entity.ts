import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CommunityComment } from './community-comment.entity';
import { User } from './user.entity';
import { IsDateString, IsNumber } from 'class-validator';

@Entity({ name: 'community_comment_like' })
export class CommunityCommentLike {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CommunityComment)
  @JoinColumn({ name: 'comment_id', referencedColumnName: 'id' })
  comment: CommunityComment;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @Column()
  @IsNumber()
  type: number;

  @CreateDateColumn()
  @IsDateString()
  created_at: Date;
}
