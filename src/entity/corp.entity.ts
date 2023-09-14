import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Corp' })
export class Corp {
  @PrimaryGeneratedColumn({ name: 'No' })
  no: number;

  @Column({ name: 'Corp_name' })
  corp_name: string;

  @Column()
  city: string;

  @Column()
  gugun: string;

  @Column()
  hashtag_top1: string;

  @Column()
  hashtag_top2: string;

  @Column()
  hashtag_top3: string;

  @Column()
  hashtag_top4: string;
}
