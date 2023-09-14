import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'user_career' })
export class UserCareer {
  @PrimaryGeneratedColumn()
  no: number;

  @Column()
  user_id: string;

  @Column({ name: 'Corp_name' })
  corp_name: string;

  @Column()
  first_date: Date;

  @Column()
  last_date: Date;

  @Column()
  type: string;

  @Column()
  review_no: number;
}
