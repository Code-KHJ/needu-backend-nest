import { IsNumber, IsString } from 'class-validator';

export class WorkingDeleteDto {
  @IsNumber()
  review_no: number;
  @IsString()
  user_id: string;
}
