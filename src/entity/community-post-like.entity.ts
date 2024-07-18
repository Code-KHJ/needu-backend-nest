import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CommunityPost } from './community-post.entity';
import { User } from './user.entity';
import { IsDateString, IsNumber } from 'class-validator';

@Entity({ name: 'community_post_like' })
export class CommunityPostLike {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CommunityPost)
  @JoinColumn({ name: 'post_id', referencedColumnName: 'id' })
  post: CommunityPost;

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
