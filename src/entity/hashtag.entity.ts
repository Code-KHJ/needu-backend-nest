import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Hashtag_Posts' })
export class Hashtag {
  @PrimaryGeneratedColumn({ name: 'No' })
  no: number;

  @Column({ name: 'Corp_name' })
  corp_name: string;

  @Column()
  review_no: number;

  @Column({ nullable: true })
  hashtag_1: string;

  @Column({ nullable: true })
  hashtag_2: string;

  @Column({ nullable: true })
  hashtag_3: string;

  @Column({ nullable: true })
  hashtag_4: string;

  @Column({ nullable: true })
  hashtag_5: string;

  @Column({ nullable: true })
  hashtag_6: string;

  @Column({ nullable: true })
  hashtag_7: string;

  @Column({ nullable: true })
  hashtag_8: string;

  @Column({ nullable: true })
  hashtag_9: string;

  @Column({ nullable: true })
  hashtag_10: string;

  @Column({ nullable: true })
  hashtag_11: string;

  @Column({ nullable: true })
  hashtag_12: string;

  @Column({ nullable: true })
  hashtag_13: string;

  @Column({ nullable: true })
  hashtag_14: string;

  @Column({ nullable: true })
  hashtag_15: string;

  @Column({ nullable: true })
  hashtag_16: string;
}
