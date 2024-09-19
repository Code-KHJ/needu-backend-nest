import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CommunityTopic } from './community-topic.entity';
import { User } from './user.entity';
import { IsBoolean, IsDateString, IsNumber, IsString, MinLength } from 'class-validator';
import { BlindType } from './blind-type.entity';
import { CommunityPostLike } from './community-post-like.entity';
import { CommunityComment } from './community-comment.entity';
import { CommunityCommentAccepted } from './community_comment_accepted.entity';
import { CommunityWeeklyBest } from './community-weekly-best.entity';

@Entity({ name: 'community_post' })
export class CommunityPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  @MinLength(1)
  title: string;

  @Column()
  @IsNumber()
  topic_id: number;

  @Column()
  @IsNumber()
  user_id: number;

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
  @IsBoolean()
  is_del: boolean = false;

  @Column()
  @IsNumber()
  blind: number = 1;

  @Column()
  @IsNumber()
  view: number = 0;

  @ManyToOne(() => BlindType)
  @JoinColumn({ name: 'blind', referencedColumnName: 'id' })
  blindType: BlindType;

  @ManyToOne(() => CommunityTopic)
  @JoinColumn({ name: 'topic_id', referencedColumnName: 'id' })
  topic: CommunityTopic;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @OneToMany(() => CommunityPostLike, like => like.post)
  likes: CommunityPostLike[];

  @OneToMany(() => CommunityComment, comment => comment.post)
  comments: CommunityComment[];

  @OneToOne(() => CommunityCommentAccepted, comment_accepted => comment_accepted.post)
  comment_accepted: CommunityCommentAccepted;

  @OneToOne(() => CommunityWeeklyBest, wb => wb.post)
  wb: CommunityWeeklyBest;
}
