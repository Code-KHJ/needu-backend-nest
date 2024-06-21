import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IsDateString, IsNumber, IsString, Length, MinLength } from 'class-validator';

@Entity({ name: 'review_posts_training' })
export class ReviewTraning {
  @PrimaryGeneratedColumn({ name: 'No' })
  no: number;

  @Column({ name: 'Corp_name' })
  @IsString()
  corp_name: string;

  @Column()
  @IsString()
  user_id: string;

  @Column()
  @IsNumber()
  year: number;

  @Column()
  @IsString()
  season: string;

  @Column()
  @IsString()
  cost: string;

  @Column()
  @IsString()
  number_of_pparcitipants: string;

  @Column()
  @IsString()
  duration: string;

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

  @Column()
  @IsDateString()
  created_date: Date;

  @Column()
  @IsDateString()
  modified_date: Date;

  @Column()
  @IsNumber()
  likes: number;

  @Column()
  blind: boolean;
}
