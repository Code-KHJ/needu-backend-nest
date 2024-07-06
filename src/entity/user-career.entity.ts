import { IsDateString, IsString } from 'class-validator';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Review } from './review.entity';

@Entity({ name: 'user_career' })
export class UserCareer {
  @PrimaryGeneratedColumn()
  no: number;

  @Column()
  @IsString()
  user_id: string;

  @Column({ name: 'Corp_name' })
  @IsString()
  corp_name: string;

  @Column()
  @IsString()
  first_date: string;

  @Column()
  @IsString()
  last_date: string;

  @Column()
  @IsString()
  type: string;

  @Column()
  review_no: number;

  @Column()
  is_del: boolean;

  @OneToOne(() => Review, review => review.userCareer)
  @JoinColumn({ name: 'review_no', referencedColumnName: 'no' })
  review: Review;
}
