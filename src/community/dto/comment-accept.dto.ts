import { IsNumber } from 'class-validator';

export class CommunityCommentAcceptDto {
  @IsNumber()
  comment_id: number;
  @IsNumber()
  post_id: number;
}
