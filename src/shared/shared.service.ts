import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CareerType } from 'src/entity/career-type.entity';
import { Report } from 'src/entity/report.entity';
import { ReviewHashtag } from 'src/entity/review-hashtag.entity';
import { UtilService } from 'src/util/util.service';
import { Repository } from 'typeorm';
import { ReportCreateDto } from './dto/report-create.dto';
import { ActivityType } from 'src/entity/activity-type.entity';
import { ActivityLog } from 'src/entity/activity-log.entity';
import { User } from 'src/entity/user.entity';

@Injectable()
export class SharedService {
  constructor(
    @InjectRepository(CareerType)
    private readonly careerTypeRepository: Repository<CareerType>,
    @InjectRepository(ReviewHashtag)
    private readonly reviewHashtagRepository: Repository<ReviewHashtag>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(ActivityType)
    private readonly activityTypeRepository: Repository<ActivityType>,
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

  async addPoint(userId: number, type: number, reason?: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    const activityType = await this.activityTypeRepository.findOne({ where: { id: type } });
    //출석일 경우 중복 제외
    if (type === 2) {
    }
    //개인정보 추가일 경우 중복 제외
    else if (type === 8) {
    } else {
      const newLog = await this.activityLogRepository.create({ user: user, type: activityType, reason: reason || null });
      await this.activityLogRepository.save(newLog);
    }

    let totalPoints = 0;
    const activityLog = await this.activityLogRepository.find({ where: { user: { id: userId } }, relations: ['type'] });
    activityLog.map(log => (totalPoints += log.type.point));

    await this.userRepository.update(userId, {
      activity_points: totalPoints,
      modified_date: () => 'modified_date',
    });
  }

  async revokePoint(userId: number, type: number, reason?: string) {
    const log = await this.activityLogRepository.findOne({ where: { user: { id: userId }, type: { id: type }, reason: reason || null, is_del: false } });

    console.log(log);
  }
}
