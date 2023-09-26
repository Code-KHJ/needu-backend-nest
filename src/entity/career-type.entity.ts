import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'career_type' })
export class CareerType {
  @PrimaryGeneratedColumn({ name: 'Career_no' })
  no: number;

  @Column()
  type: string;
}
