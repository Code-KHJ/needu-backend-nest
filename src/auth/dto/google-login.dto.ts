import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleLoginDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  nickname: string;
}
