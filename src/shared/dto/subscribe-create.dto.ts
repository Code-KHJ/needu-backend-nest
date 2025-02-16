import { OmitType } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsString } from 'class-validator';
import { Subscribe } from 'src/entity/subscribe.entity';

export class SubscribeCreateDto extends OmitType(Subscribe, ['id', 'created_at']) {
  @IsString()
  nickname: string;

  @IsEmail()
  email: string;

  @IsBoolean()
  subscribe: boolean;
}
