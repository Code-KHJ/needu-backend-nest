import { IsBoolean, IsDateString, IsNumber, IsString } from 'class-validator';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'report' })
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  target: string;

  @Column()
  @IsNumber()
  target_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @Column()
  @IsString()
  report_type: string;

  @Column('text', { nullable: true })
  @IsString()
  comment: string;

  @CreateDateColumn()
  @IsDateString()
  created_at: Date;

  @Column()
  @IsBoolean()
  resolved: boolean;
}
