import { IsNumber, IsString } from 'class-validator';

export class DeleteReviewDto {
  @IsNumber()
  review_no: number;
  @IsString()
  user_id: string;
}
