import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class KakaoLoginDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  nickname: string;

  @IsString()
  @Matches(/^(010)[0-9]{7,8}$/)
  phonenumber: string;
}
