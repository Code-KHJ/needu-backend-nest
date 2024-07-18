import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Review } from './review.entity';
import { IsOptional, IsString } from 'class-validator';

@Entity({ name: 'hashtag_posts' })
export class Hashtag {
  @PrimaryGeneratedColumn({ name: 'No' })
  no: number;

  @Column({ name: 'Corp_name' })
  corp_name: string;

  @Column()
  review_no: number;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  hashtag_1: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  hashtag_2: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  hashtag_3: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  hashtag_4: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  hashtag_5: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  hashtag_6: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  hashtag_7: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  hashtag_8: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  hashtag_9: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  hashtag_10: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  hashtag_11: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  hashtag_12: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  hashtag_13: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  hashtag_14: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  hashtag_15: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  hashtag_16: string;

  @OneToOne(() => Review)
  @JoinColumn({ name: 'review_no' })
  review: Review;
}
