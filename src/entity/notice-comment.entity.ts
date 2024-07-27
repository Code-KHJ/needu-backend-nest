import { IsBoolean, IsDateString, IsNumber } from 'class-validator';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { BlindType } from './blind-type.entity';
import { Notice } from './notice.entity';
import { User } from './user.entity';
import { NoticeCommentLike } from './notice-comment-like.entity';

@Entity({ name: 'notice_comment' })
export class NoticeComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNumber()
  notice_id: number;

  @Column()
  @IsNumber()
  user_id: number;

  @Column({ nullable: true })
  @IsNumber()
  parent_id: number;

  @Column('text')
  content: string;

  @CreateDateColumn()
  @IsDateString()
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  @IsDateString()
  updated_at: Date;

  @Column()
  @IsBoolean()
  is_del: boolean = false;

  @Column()
  @IsNumber()
  blind: number = 1;

  @ManyToOne(() => BlindType)
  @JoinColumn({ name: 'blind', referencedColumnName: 'id' })
  blindType: BlindType;

  @OneToMany(() => NoticeCommentLike, like => like.comment)
  likes: NoticeCommentLike[];

  @ManyToOne(() => Notice)
  @JoinColumn({ name: 'notice_id', referencedColumnName: 'id' })
  notice: Notice;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;
}
