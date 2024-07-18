import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CommunityTopic } from './community-topic.entity';
import { User } from './user.entity';
import { IsDateString, IsNumber, IsString, MinLength } from 'class-validator';
import { BlindType } from './blind-type.entity';
import { CommunityPostLike } from './community-post-like.entity';
import { CommunityComment } from './community-comment.entity';
import { CommunityCommentAccepted } from './community_comment_accepted.entity';

@Entity({ name: 'community_post' })
export class CommunityPost {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CommunityTopic)
  @JoinColumn({ name: 'topic_id', referencedColumnName: 'id' })
  topic: CommunityTopic;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @Column()
  @IsString()
  @MinLength(1)
  title: string;

  @Column('text')
  @IsString()
  @MinLength(1)
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

  @Column()
  @IsNumber()
  view: number;

  @OneToMany(() => CommunityPostLike, like => like.post)
  likes: CommunityPostLike[];

  @OneToMany(() => CommunityComment, comment => comment.post)
  comments: CommunityComment[];

  @OneToOne(() => CommunityCommentAccepted, comment_accepted => comment_accepted.post)
  comment_accepted: CommunityCommentAccepted;
}
