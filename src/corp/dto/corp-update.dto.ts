import { OmitType } from '@nestjs/swagger';
import { Corp } from '../../entity/corp.entity';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CorpUpdateDto extends OmitType(Corp, ['id', 'city', 'gugun']) {
  @IsOptional()
  @IsString()
  corp_name: string;

  @IsOptional()
  @IsNumber()
  score: number;

  @IsOptional()
  @IsString()
  hashtag_top1: string;

  @IsOptional()
  @IsString()
  hashtag_top2: string;

  @IsOptional()
  @IsString()
  hashtag_top3: string;

  @IsOptional()
  @IsString()
  hashtag_top4: string;

  @IsOptional()
  @IsNumber()
  review_cnt: number;
}
