import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IsBoolean, IsDateString, IsNumber, IsString, MinLength } from 'class-validator';

import { User } from './user.entity';
import { NoticeLike } from './notice-like.entity';
import { NoticeComment } from './notice-comment.entity';

@Entity({ name: 'notice' })
export class Notice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNumber()
  user_id: number;

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
  is_show: boolean = false;

  @Column({ nullable: true })
  @IsNumber()
  sort_order: number;

  @Column()
  @IsNumber()
  view: number = 0;

  @Column()
  @IsBoolean()
  is_del: boolean = false;

  @OneToMany(() => NoticeLike, like => like.notice)
  likes: NoticeLike[];

  @OneToMany(() => NoticeComment, comment => comment.notice)
  comments: NoticeComment[];
}
