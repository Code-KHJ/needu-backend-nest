import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IsDateString, IsNumber, IsString, Length, MinLength } from 'class-validator';
import { Corp } from './corp.entity';
import { BlindType } from './blind-type.entity';
import { ReviewTrainingLike } from './review-training-like.entity';
import { User } from './user.entity';

@Entity({ name: 'review_posts_training' })
export class ReviewTraning {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  corp_name: string;

  @Column()
  @IsString()
  user_id: string;

  @Column()
  @IsString()
  year: string;

  @Column()
  @IsString()
  season: string;

  @Column()
  @IsNumber()
  cost: number;

  @Column()
  @IsNumber()
  number_of_participants: number;

  @Column()
  @IsNumber()
  duration: number;

  @Column('decimal', { precision: 3, scale: 1 })
  @IsNumber()
  total_score: number;

  @Column('decimal', { precision: 3, scale: 1 })
  @IsNumber()
  growth_score: number;

  @Column('decimal', { precision: 3, scale: 1 })
  @IsNumber()
  worth_score: number;

  @Column('decimal', { precision: 3, scale: 1 })
  @IsNumber()
  recommend_score: number;

  @Column('decimal', { precision: 3, scale: 1 })
  @IsNumber()
  supervisor_score: number;

  @Column()
  @MinLength(1)
  highlight: string;

  @Column('longtext')
  @IsString()
  @Length(30, 1000)
  pros: string;

  @Column('longtext')
  @IsString()
  @Length(30, 1000)
  cons: string;

  @CreateDateColumn()
  @IsDateString()
  created_date: Date;

  @UpdateDateColumn({ nullable: true })
  @IsDateString()
  modified_date: Date;

  @Column({ nullable: true })
  @IsNumber()
  likes: number;

  @Column()
  blind: number;

  @Column()
  is_del: boolean;

  @ManyToOne(() => BlindType)
  @JoinColumn({ name: 'blind', referencedColumnName: 'id' })
  blindType: BlindType;

  @OneToMany(() => ReviewTrainingLike, reviewTrainingLike => reviewTrainingLike.review)
  reviewTrainingLikes: ReviewTrainingLike[];

  @ManyToOne(() => User, user => user.review_training)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user: User;

  @ManyToOne(() => Corp, corp => corp.reviews_training, { eager: true })
  @JoinColumn({ name: 'corp_name', referencedColumnName: 'corp_name' })
  corp: Corp;
}
