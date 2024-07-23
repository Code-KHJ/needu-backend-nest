import { PickType } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { Notice } from 'src/entity/notice.entity';

export class NoticeUpdateDto extends PickType(Notice, ['title', 'is_show', 'user_id']) {
  @IsNumber()
  id: number;
  @IsString()
  html: string;
  @IsString()
  markdown: string;
}
