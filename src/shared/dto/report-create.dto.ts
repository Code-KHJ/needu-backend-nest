import { OmitType } from '@nestjs/swagger';
import { Report } from 'src/entity/report.entity';

export class ReportCreateDto extends OmitType(Report, ['id', 'user', 'created_at', 'resolved']) {
  user_id: number;
}
