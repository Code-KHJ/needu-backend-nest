import { IsBoolean, IsDateString } from 'class-validator';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CommunityPost } from './community-post.entity';
import { User } from './user.entity';

@Entity({ name: 'community_weekly_best' })
export class CommunityWeeklyBest {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => CommunityPost)
  @JoinColumn({ name: 'post_id', referencedColumnName: 'id' })
  post: CommunityPost;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'select_by', referencedColumnName: 'id' })
  user: User;

  @CreateDateColumn()
  @IsDateString()
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  @IsDateString()
  updated_at: Date;

  @Column()
  @IsBoolean()
  is_del: boolean = false;
}
