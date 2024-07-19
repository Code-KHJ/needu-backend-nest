import { OmitType } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { Report } from 'src/entity/report.entity';

export class ReportCreateDto extends OmitType(Report, ['id', 'user', 'created_at', 'resolved']) {
  @IsNumber()
  user_id: number;
}
