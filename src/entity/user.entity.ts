import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn({ name: 'No' })
  no: number;

  @Column()
  id: string;

  @Column()
  password: string;

  @Column()
  phonenumber: string;

  @Column()
  nickname: string;

  @Column()
  authority: number;

  @Column()
  marketing_email: boolean;

  @Column()
  marketing_SMS: boolean;

  @Column()
  info_period: string;

  @Column()
  created_date: Date;

  @Column()
  modified_date: Date;

  @Column()
  login_date: Date;
}
