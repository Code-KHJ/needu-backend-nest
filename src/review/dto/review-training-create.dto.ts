import { OmitType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { ReviewTraning } from 'src/entity/review-training.entity';

export class TrainingCreateDto extends OmitType(ReviewTraning, ['id', 'blind', 'likes', 'is_del', 'total_score', 'created_date', 'modified_date']) {}
