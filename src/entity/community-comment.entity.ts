import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CommunityPost } from './community-post.entity';
import { IsBoolean, isDateString, IsDateString, IsNumber } from 'class-validator';
import { User } from './user.entity';
import { BlindType } from './blind-type.entity';
import { CommunityCommentLike } from './community-comment-like.entity';

@Entity({ name: 'community_comment' })
export class CommunityComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNumber()
  post_id: number;

  @Column()
  @IsNumber()
  user_id: number;

  @Column({ nullable: true })
  @IsNumber()
  parent_id: number;

  @Column('text')
  content: string;

  @CreateDateColumn()
  @IsDateString()
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  @IsDateString()
  updated_at: Date;

  @Column()
  is_del: boolean;

  @ManyToOne(() => BlindType)
  @JoinColumn({ name: 'blind', referencedColumnName: 'id' })
  blind: BlindType;

  @OneToMany(() => CommunityCommentLike, like => like.comment)
  likes: CommunityCommentLike[];

  @ManyToOne(() => CommunityPost)
  @JoinColumn({ name: 'post_id', referencedColumnName: 'id' })
  post: CommunityPost;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;
}
