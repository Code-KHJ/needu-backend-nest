import { IsNotEmpty, IsString } from 'class-validator';

export class UserDuplicDto {
  @IsString()
  @IsNotEmpty()
  item: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}