import { IsNumber, IsString } from 'class-validator';

export class NoticeCommentLikeDto {
  @IsNumber()
  comment_id: number;
  @IsNumber()
  user_id: number;
  @IsString()
  type: string;
}
