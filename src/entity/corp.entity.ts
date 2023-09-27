import { IsNumber, IsString } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Corp' })
export class Corp {
  @PrimaryGeneratedColumn({ name: 'No' })
  no: number;

  @Column({ name: 'Corp_name' })
  @IsString()
  corp_name: string;

  @Column()
  city: string;

  @Column()
  gugun: string;

  @Column()
  @IsNumber()
  score: number;

  @Column()
  hashtag_top1: string;

  @Column()
  hashtag_top2: string;

  @Column()
  hashtag_top3: string;

  @Column()
  hashtag_top4: string;

  @Column()
  @IsNumber()
  review_cnt: number;
}
