import { IsNumber, IsString } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Review } from './review.entity';
import { ReviewTraning } from './review-training.entity';

@Entity({ name: 'corp' })
export class Corp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'corp_name', unique: true })
  @IsString()
  corp_name: string;

  @Column()
  city: string;

  @Column()
  gugun: string;

  @Column({ type: 'json', nullable: true })
  hashtag: any;

  @OneToMany(() => Review, review => review.corp)
  reviews: Review[];

  @OneToMany(() => ReviewTraning, review_training => review_training.corp)
  reviews_training: ReviewTraning[];
}
