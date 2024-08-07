import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IsArray, IsBoolean, IsDateString, IsNumber, IsString, Length, MinLength } from 'class-validator';
import { Corp } from './corp.entity';
import { UserCareer } from './user-career.entity';
import { BlindType } from './blind-type.entity';
import { ReviewLike } from './review-like.entity';
import { User } from './user.entity';

@Entity({ name: 'review_posts' })
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  corp_name: string;

  @Column()
  @IsString()
  user_id: string;

  @Column({ type: 'json' })
  @IsArray()
  hashtag: string[];

  @Column('decimal', { precision: 3, scale: 1 })
  @IsNumber()
  total_score: number;

  @Column('decimal', { precision: 3, scale: 1 })
  @IsNumber()
  growth_score: number;

  @Column('decimal', { precision: 3, scale: 1 })
  @IsNumber()
  leadership_score: number;

  @Column('decimal', { precision: 3, scale: 1 })
  @IsNumber()
  reward_score: number;

  @Column('decimal', { precision: 3, scale: 1 })
  @IsNumber()
  worth_score: number;

  @Column('decimal', { precision: 3, scale: 1 })
  @IsNumber()
  culture_score: number;

  @Column('decimal', { precision: 3, scale: 1 })
  @IsNumber()
  worklife_score: number;

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
  @IsNumber()
  blind: number = 1;

  @Column()
  @IsBoolean()
  is_del: boolean = false;

  @OneToOne(() => UserCareer, userCareer => userCareer.review)
  userCareer: UserCareer;

  @ManyToOne(() => BlindType)
  @JoinColumn({ name: 'blind', referencedColumnName: 'id' })
  blindType: BlindType;

  @OneToMany(() => ReviewLike, reviewLike => reviewLike.review)
  reviewLikes: ReviewLike[];

  @ManyToOne(() => User, user => user.reviews)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user: User;

  @ManyToOne(() => Corp, corp => corp.reviews, { eager: true })
  @JoinColumn({ name: 'corp_name', referencedColumnName: 'corp_name' })
  corp: Corp;
}
