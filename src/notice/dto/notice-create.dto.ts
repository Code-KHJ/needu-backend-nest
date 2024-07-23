import { PickType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Notice } from 'src/entity/notice.entity';

export class NoticeCreateDto extends PickType(Notice, ['title', 'is_show', 'user_id']) {
  @IsString()
  html: string;
  @IsString()
  markdown: string;
}
