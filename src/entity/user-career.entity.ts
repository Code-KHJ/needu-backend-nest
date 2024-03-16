import { IsDateString, IsString } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'user_career' })
export class UserCareer {
  @PrimaryGeneratedColumn()
  no: number;

  @Column()
  @IsString()
  user_id: string;

  @Column({ name: 'Corp_name' })
  @IsString()
  corp_name: string;

  @Column()
  @IsDateString()
  first_date: Date;

  @Column()
  @IsDateString()
  last_date: Date;

  @Column()
  @IsString()
  type: string;

  @Column()
  review_no: number;
}
