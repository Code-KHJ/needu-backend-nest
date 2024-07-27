import { IsDateString, IsNumber } from 'class-validator';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Notice } from './notice.entity';
import { User } from './user.entity';

@Entity({ name: 'notice_like' })
export class NoticeLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNumber()
  notice_id: number;

  @Column()
  @IsNumber()
  user_id: number;

  @Column()
  @IsNumber()
  type: number;

  @CreateDateColumn()
  @IsDateString()
  created_at: Date;

  @ManyToOne(() => Notice)
  @JoinColumn({ name: 'notice_id', referencedColumnName: 'id' })
  notice: Notice;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;
}
