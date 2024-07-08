import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'career_type' })
export class CareerType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;
}
