import { IsString } from 'class-validator';
import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'community_type' })
export class CommunityType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  type: string;
}
