import { PickType } from '@nestjs/swagger';
import { Corp } from '../../entity/corp.entity';
import { IsNotEmpty } from 'class-validator';

export class CorpCreateDto extends PickType(Corp, ['corp_name', 'city', 'gugun']) {
  @IsNotEmpty()
  corp_name: string;

  @IsNotEmpty()
  city: string;

  @IsNotEmpty()
  gugun: string;
}
