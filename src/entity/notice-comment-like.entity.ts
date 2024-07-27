import { IsDateString, IsNumber } from 'class-validator';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { NoticeComment } from './notice-comment.entity';
import { User } from './user.entity';

@Entity({ name: 'notice_comment_like' })
export class NoticeCommentLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNumber()
  comment_id: number;

  @Column()
  @IsNumber()
  user_id: number;

  @Column()
  @IsNumber()
  type: number;

  @CreateDateColumn()
  @IsDateString()
  created_at: Date;

  @ManyToOne(() => NoticeComment)
  @JoinColumn({ name: 'comment_id', referencedColumnName: 'id' })
  comment: NoticeComment;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;
}
