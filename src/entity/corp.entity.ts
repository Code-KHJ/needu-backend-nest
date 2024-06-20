import { IsNumber, IsString } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Review } from './review.entity';

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

  @Column({ type: 'json' })
  hashtag: any;

  @OneToMany(() => Review, review => review.corp)
  reviews: Review[];
}
