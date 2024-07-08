import { IsDateString, IsString } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'review_like' })
export class ReviewLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  type: string;

  @Column()
  review_id: number;

  @Column()
  user_id: number;

  @Column()
  @IsDateString()
  created_at: Date;
}
