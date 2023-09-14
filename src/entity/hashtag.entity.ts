import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Hashtag_Posts' })
export class Hashtag {
  @PrimaryGeneratedColumn({ name: 'No' })
  no: number;

  @Column({ name: 'Corp_name' })
  corp_name: string;

  @Column()
  review_no: number;

  @Column()
  hashtag_1: string;

  @Column()
  hashtag_2: string;

  @Column()
  hashtag_3: string;

  @Column()
  hashtag_4: string;

  @Column()
  hashtag_5: string;

  @Column()
  hashtag_6: string;

  @Column()
  hashtag_7: string;

  @Column()
  hashtag_8: string;

  @Column()
  hashtag_9: string;

  @Column()
  hashtag_10: string;

  @Column()
  hashtag_11: string;

  @Column()
  hashtag_12: string;

  @Column()
  hashtag_13: string;

  @Column()
  hashtag_14: string;

  @Column()
  hashtag_15: string;

  @Column()
  hashtag_16: string;
}
