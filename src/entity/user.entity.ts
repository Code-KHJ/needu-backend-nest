import { IsBoolean, IsEmail, IsNumber, IsString, Length, Matches, MinLength } from 'class-validator';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Review } from './review.entity';
import { ReviewTraning } from './review-training.entity';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsEmail()
  @Length(1, 40)
  user_id: string;

  @Column()
  @IsString()
  @Length(8, 16)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,16}$/)
  password: string;

  @Column()
  @Matches(/^(010)[0-9]{7,8}$/)
  phonenumber: string;

  @Column({ unique: true })
  @IsString()
  @Matches(/^[A-Za-z가-힣0-9._-]{2,}$/)
  @MinLength(2)
  nickname: string;

  @Column()
  @IsNumber()
  authority: number;

  @Column()
  @IsBoolean()
  policy: boolean;

  @Column()
  @IsBoolean()
  personal_info: boolean;

  @Column()
  @IsBoolean()
  marketing_email: boolean;

  @Column()
  @IsBoolean()
  marketing_SMS: boolean;

  @Column({ nullable: true })
  @IsString()
  info_period: string | null;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn({ nullable: true })
  modified_date: Date;

  @Column({ nullable: true })
  login_date: Date;

  @Column({ nullable: true })
  @IsString()
  google: boolean;

  @Column({ nullable: true })
  @IsString()
  kakao: boolean;

  @OneToMany(() => Review, review => review.user)
  reviews: Review[];

  @OneToMany(() => ReviewTraning, review_training => review_training.user)
  review_training: ReviewTraning[];
}
