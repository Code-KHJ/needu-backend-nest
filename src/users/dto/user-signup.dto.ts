import { IsBoolean, IsNotEmpty, IsString, Length, MinLength, minLength } from 'class-validator';

export class UserSignupDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @Length(8, 16)
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  phonenumber: string;

  @IsString()
  @MinLength(2)
  @IsNotEmpty()
  nickname: string;

  @IsBoolean()
  @IsNotEmpty()
  check_2: boolean;

  @IsBoolean()
  @IsNotEmpty()
  check_3: boolean;

  @IsBoolean()
  @IsNotEmpty()
  check_4: boolean;

  @IsBoolean()
  @IsNotEmpty()
  check_5: boolean;

  @IsString()
  @IsNotEmpty()
  radio1: string;
}
