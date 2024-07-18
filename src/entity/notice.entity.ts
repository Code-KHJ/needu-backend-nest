import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IsBoolean, IsDateString, IsNumber, IsString, MinLength } from 'class-validator';

import { User } from './user.entity';

@Entity({ name: 'notice' })
export class Notice {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @Column()
  @IsString()
  @MinLength(1)
  title: string;

  @Column('text')
  @IsString()
  @MinLength(1)
  content: string;

  @CreateDateColumn()
  @IsDateString()
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  @IsDateString()
  updated_at: Date;

  @Column()
  @IsBoolean()
  is_show: boolean;

  @Column({ nullable: true })
  @IsNumber()
  sort_order: number;

  @Column()
  @IsNumber()
  view: number;
}
