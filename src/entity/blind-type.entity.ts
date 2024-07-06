import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'blind_type' })
export class BlindType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  reason: string;
}
