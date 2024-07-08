import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'review_hashtag' })
export class ReviewHashtag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;
}
