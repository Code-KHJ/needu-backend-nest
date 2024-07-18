import { IsDateString, IsNumber, IsString } from 'class-validator';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ReviewTraning } from './review-training.entity';

@Entity({ name: 'review_training_like' })
export class ReviewTrainingLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNumber()
  review_id: number;

  @Column()
  @IsNumber()
  user_id: number;

  @CreateDateColumn()
  @IsDateString()
  created_at: Date;

  @ManyToOne(() => ReviewTraning, review => review.reviewTrainingLikes)
  @JoinColumn({ name: 'review_id' })
  review: ReviewTraning;
}
