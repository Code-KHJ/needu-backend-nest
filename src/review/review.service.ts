import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Review } from '../entity/review.entity';
import { Corp } from '../entity/corp.entity';
import { Hashtag } from '../entity/hashtag.entity';
import { WorkingCreateDto } from './dto/review-create.dto';
import { CorpService } from 'src/corp/corp.service';
import { UserService } from 'src/user/user.service';
import { CareerCreateDto } from 'src/user/dto/career-create.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Corp)
    private readonly corpRepository: Repository<Corp>,
    @InjectRepository(Hashtag)
    private readonly hashtagRepository: Repository<Hashtag>,
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly corpService: CorpService,
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
  ) {}

  async createWorkingReview(workingCreateDto: WorkingCreateDto) {
    if (!workingCreateDto.corp) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const total_score =
      Math.round(
        ((workingCreateDto.growth_score +
          workingCreateDto.leadership_score +
          workingCreateDto.reward_score +
          workingCreateDto.worth_score +
          workingCreateDto.culture_score +
          workingCreateDto.worklife_score) /
          6) *
          10,
      ) / 10;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const review = this.reviewRepository.create({ ...workingCreateDto, total_score: total_score });
      const savedReview = await queryRunner.manager.save(review);

      const careerDto: CareerCreateDto = {
        user_id: workingCreateDto.user_id,
        corp_name: workingCreateDto.corp.corp_name,
        first_date: workingCreateDto.start_date,
        last_date: workingCreateDto.end_date,
        type: workingCreateDto.career_type,
        review_no: savedReview.no,
      };
      const career = await this.userService.createCareer(careerDto);
      await queryRunner.manager.save(career);

      await queryRunner.commitTransaction();
      return { review: savedReview, career };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
      this.corpService.updateHashtag(workingCreateDto.corp.corp_name);
    }
  }
}
