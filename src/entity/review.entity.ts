import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IsArray, IsDateString, IsNumber, IsString, Length, MinLength } from 'class-validator';
import { Corp } from './corp.entity';

@Entity({ name: 'Review_Posts' })
export class Review {
  @PrimaryGeneratedColumn({ name: 'No' })
  no: number;

  @ManyToOne(() => Corp, corp => corp.reviews)
  @JoinColumn({ name: 'corp_name', referencedColumnName: 'corp_name' })
  corp: Corp;

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
