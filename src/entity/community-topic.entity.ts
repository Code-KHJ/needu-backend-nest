import { IsNumber, IsString } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { CommunityType } from './community-type.entity';

@Entity({ name: 'community_topic' })
export class CommunityTopic {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CommunityType, { nullable: false, eager: true })
  @JoinColumn({ name: 'type_id', referencedColumnName: 'id' })
  type: CommunityType;

  @Column()
  @IsString()
  topic: string;

  @Column()
  @IsString()
  description: string;
}
