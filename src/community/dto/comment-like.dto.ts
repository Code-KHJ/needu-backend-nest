import { IsNumber, IsString } from 'class-validator';

export class CommentLikeDto {
  @IsNumber()
  comment_id: number;
  @IsNumber()
  user_id: number;
  @IsString()
  type: string;
}
