import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CareerType } from 'src/entity/career-type.entity';
import { Report } from 'src/entity/report.entity';
import { ReviewHashtag } from 'src/entity/review-hashtag.entity';
import { UtilService } from 'src/util/util.service';
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
    private readonly utilService: UtilService,
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
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }
    const report = await this.reportRepository.create(reportCreateDto);
    const response = await this.reportRepository.save(report);
    const savedReport = await this.reportRepository.findOne({ where: { id: response.id }, relations: ['user'] });
    const slackMsg = `
=======유저 일반 신고=======
신고자 : ${savedReport.user.user_id}
신고유형 : ${savedReport.report_type}
신고사유 : ${savedReport.comment}
신고대상 : ${savedReport.target}
신고대상 번호 : ${savedReport.target_id}
`;
    if (response.id) {
      this.utilService.slackWebHook('report', slackMsg);
      return { msg: '신고완료' };
    } else {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }
  }
}
