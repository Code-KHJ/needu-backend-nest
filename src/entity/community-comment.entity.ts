import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CommunityPost } from './community-post.entity';
import { IsBoolean, isDateString, IsDateString, isNumber, IsNumber, IsOptional, IsString } from 'class-validator';
import { User } from './user.entity';
import { BlindType } from './blind-type.entity';
import { CommunityCommentLike } from './community-comment-like.entity';
import { CommunityCommentAccepted } from './community_comment_accepted.entity';

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
  @IsOptional()
  parent_id: number;

  @Column()
  @IsString()
  content: string;

  @CreateDateColumn()
  @IsDateString()
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  @IsDateString()
  updated_at: Date;

  @Column()
  @IsBoolean()
  is_del: boolean = false;

  @Column()
  @IsNumber()
  blind: number = 1;

  @ManyToOne(() => BlindType)
  @JoinColumn({ name: 'blind', referencedColumnName: 'id' })
  blindType: BlindType;

  @OneToMany(() => CommunityCommentLike, like => like.comment)
  likes: CommunityCommentLike[];

  @ManyToOne(() => CommunityPost)
  @JoinColumn({ name: 'post_id', referencedColumnName: 'id' })
  post: CommunityPost;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @OneToOne(() => CommunityCommentAccepted, accepted => accepted.comment)
  accepted: CommunityCommentAccepted;
}
