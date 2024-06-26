import { IsBoolean, IsEmail, IsNumber, IsString, Length, Matches, MinLength } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn({ name: 'No' })
  no: number;

  @Column()
  @IsEmail()
  @Length(1, 40)
  id: string;

  @Column()
  @IsString()
  @Length(8, 16)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,16}$/)
  password: string;

  @Column()
  @Matches(/^(010)[0-9]{7,8}$/)
  phonenumber: string;

  @Column()
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

  @Column()
  created_date: Date;

  @Column()
  modified_date: Date;

  @Column()
  login_date: Date;

  @Column()
  @IsString()
  google: boolean;

  @Column()
  @IsString()
  kakao: boolean;
}
