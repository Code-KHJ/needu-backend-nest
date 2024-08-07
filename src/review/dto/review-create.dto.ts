import { OmitType } from '@nestjs/swagger';
import { Review } from '../../entity/review.entity';
import { IsString } from 'class-validator';

export class WorkingCreateDto extends OmitType(Review, ['id', 'blind', 'likes', 'is_del', 'total_score', 'created_date', 'modified_date']) {
  @IsString()
  career_type: string;

  @IsString()
  start_date: string;

  @IsString()
  end_date: string;
}
