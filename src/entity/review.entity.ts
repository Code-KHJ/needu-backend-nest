import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Hashtag } from './hashtag.entity';

@Entity({ name: 'Review_Posts' })
export class Review {
  @PrimaryGeneratedColumn({ name: 'No' })
  no: number;

  @Column({ name: 'Corp_name' })
  corp_name: string;

  @Column()
  user_id: string;

  @Column()
  total_score: number;

  @Column()
  growth_score: number;

  @Column()
  leadership_score: number;

  @Column()
  reward_score: number;

  @Column()
  worth_score: number;

  @Column()
  culture_score: number;

  @Column()
  worklife_score: number;

  @Column()
  highlight: string;

  @Column('longtext')
  pros: string;

  @Column('longtext')
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
