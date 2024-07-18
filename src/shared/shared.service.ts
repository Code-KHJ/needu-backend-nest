import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CareerType } from 'src/entity/career-type.entity';
import { Report } from 'src/entity/report.entity';
import { ReviewHashtag } from 'src/entity/review-hashtag.entity';
import { Repository } from 'typeorm';
import { ReportCreateDto } from './dto/report-create.dto';

@Injectable()
export class SharedService {
  constructor(
    @InjectRepository(CareerType)
    private readonly careerTypeRepository: Repository<CareerType>,
    @InjectRepository(ReviewHashtag)
    private readonly reviewHashtagRepository: Repository<ReviewHashtag>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
  ) {}

  async getCareerType() {
    const careerType = await this.careerTypeRepository.find();

    return careerType;
  }

  async getHashtag() {
    const hashtag = await this.reviewHashtagRepository.find();

    return hashtag;
  }

  async createReport(user_id: number, reportCreateDto: ReportCreateDto) {
    if (user_id !== reportCreateDto.user_id) {
      return;
    }
    const report = await this.reportRepository.create();
  }
}
