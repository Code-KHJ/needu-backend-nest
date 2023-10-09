import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNumber, Length, MinLength } from 'class-validator';

@Entity({ name: 'Review_Posts' })
export class Review {
  @PrimaryGeneratedColumn({ name: 'No' })
  no: number;

  @Column({ name: 'Corp_name' })
  corp_name: string;

  @Column()
  user_id: string;

  @Column()
  @IsNumber()
  total_score: number;

  @Column()
  @IsNumber()
  growth_score: number;

  @Column()
  @IsNumber()
  leadership_score: number;

  @Column()
  @IsNumber()
  reward_score: number;

  @Column()
  @IsNumber()
  worth_score: number;

  @Column()
  @IsNumber()
  culture_score: number;

  @Column()
  @IsNumber()
  worklife_score: number;

  @Column()
  @MinLength(1)
  highlight: string;

  @Column('longtext')
  @Length(30, 1000)
  pros: string;

  @Column('longtext')
  @Length(30, 1000)
  cons: string;

  @Column()
  created_date: Date;

  @Column()
  modified_date: Date;

  @Column()
  likes: number;

  @Column()
  blind: boolean;
}
