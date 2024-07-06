import { IsNumber, IsString } from 'class-validator';

export class LikeDto {
  @IsNumber()
  review_no: number;

  @IsString()
  type: string;

  @IsString()
  action: string;
}
