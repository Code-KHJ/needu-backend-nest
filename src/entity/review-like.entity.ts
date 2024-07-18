import { IsDateString, IsNumber, IsString } from 'class-validator';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Review } from './review.entity';

@Entity({ name: 'review_like' })
export class ReviewLike {
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

  @ManyToOne(() => Review, review => review.reviewLikes)
  @JoinColumn({ name: 'review_id' })
  review: Review;
}
