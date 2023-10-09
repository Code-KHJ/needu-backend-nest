import { IntersectionType, PickType } from '@nestjs/swagger';
import { Hashtag } from '../../entity/hashtag.entity';
import { Review } from '../../entity/review.entity';
import { IsOptional } from 'class-validator';
import { UserCareer } from '../../entity/user-career.entity';

class Combined extends IntersectionType(UserCareer, Review, Hashtag) {}

export class ReviewWriteDto extends PickType(Combined, [
  'corp_name',
  'user_id',
  'first_date',
  'last_date',
  'type',
  'growth_score',
  'leadership_score',
  'reward_score',
  'worth_score',
  'culture_score',
  'worklife_score',
  'hashtag_1',
  'hashtag_2',
  'hashtag_3',
  'hashtag_4',
  'hashtag_5',
  'hashtag_6',
  'hashtag_7',
  'hashtag_8',
  'hashtag_9',
  'hashtag_10',
  'hashtag_11',
  'hashtag_12',
  'hashtag_13',
  'hashtag_14',
  'hashtag_15',
  'hashtag_16',
  'highlight',
  'pros',
  'cons',
]) {
  @IsOptional()
  corp_name: string;

  @IsOptional()
  user_id: string;
}
