import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'activity_type' })
export class ActivityType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column('int')
  point: number;
}
