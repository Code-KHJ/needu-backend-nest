import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'review_hashtag' })
export class ReviewHashtag {
  @PrimaryGeneratedColumn({ name: 'No' })
  no: number;

  @Column()
  content: string;
}
