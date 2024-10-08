import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { ActivityType } from './activity-type.entity';
import { IsDateString } from 'class-validator';

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

  @CreateDateColumn()
  @IsDateString()
  created_at: Date;
}
