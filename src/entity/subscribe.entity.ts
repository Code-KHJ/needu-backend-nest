import { IsBoolean, IsEmail, IsString } from 'class-validator';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'subscribe' })
export class Subscribe {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  nickname: string;

  @Column()
  @IsEmail()
  email: string;

  @Column()
  @IsBoolean()
  subscribe: boolean;

  @CreateDateColumn()
  created_at: Date;
}
