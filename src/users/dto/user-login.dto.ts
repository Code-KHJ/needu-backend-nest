import { IsNotEmpty, IsString } from 'class-validator';

export class UserLoginDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty({ message: '없으면 안돼' })
  password: string;
}
