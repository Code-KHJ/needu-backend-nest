import { OmitType } from '@nestjs/swagger';
import { Review } from '../../entity/review.entity';

export class ReviewCreateDto extends OmitType(Review, ['no', 'blind', 'likes', 'total_score', 'created_date', 'modified_date']) {}
