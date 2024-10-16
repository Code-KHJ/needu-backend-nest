import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { ActivityType } from './activity-type.entity';
import { IsBoolean, IsDateString, IsString } from 'class-validator';

@Entity({ name: 'activity_log' })
export class ActivityLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => ActivityType)
  @JoinColumn({ name: 'type_id', referencedColumnName: 'id' })
  type: ActivityType;

  @Column({ nullable: true })
  @IsString()
  reason: string;

  @Column()
  @IsBoolean()
  is_del: boolean = false;

  @CreateDateColumn()
  @IsDateString()
  created_at: Date;

  @UpdateDateColumn()
  @IsDateString()
  updated_at: Date;
}
