import { IsNumber, IsString } from 'class-validator';

export class NoticeLikeDto {
  @IsNumber()
  notice_id: number;
  @IsNumber()
  user_id: number;
  @IsString()
  type: string;
}
