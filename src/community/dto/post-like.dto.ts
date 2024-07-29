import { IsNumber, IsString } from 'class-validator';

export class PostLikeDto {
  @IsNumber()
  post_id: number;
  @IsNumber()
  user_id: number;
  @IsString()
  type: string;
}
