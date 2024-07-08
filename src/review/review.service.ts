import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, IsNull, Repository } from 'typeorm';
import { Review } from '../entity/review.entity';
import { Corp } from '../entity/corp.entity';
import { Hashtag } from '../entity/hashtag.entity';
import { WorkingCreateDto } from './dto/review-create.dto';
import { CorpService } from 'src/corp/corp.service';
import { UserService } from 'src/user/user.service';
import { CareerCreateDto } from 'src/user/dto/career-create.dto';
import { TrainingCreateDto } from './dto/review-training-create.dto';
import { ReviewTraning } from 'src/entity/review-training.entity';
import { LikeDto } from './dto/review-like.dto';
import { DeleteReviewDto } from './dto/review-delete.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(ReviewTraning)
    private readonly reviewTrainingRepository: Repository<ReviewTraning>,
    @InjectRepository(Corp)
    private readonly corpRepository: Repository<Corp>,
    @InjectRepository(Hashtag)
    private readonly hashtagRepository: Repository<Hashtag>,
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly corpService: CorpService,
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
  ) {}

  // 전현직 리뷰 생성
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
        review_no: savedReview.id,
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

  // 기관명으로 전현직 리뷰 조회
  async findWorkingReviews(corpname: string) {
    const reviews = await this.reviewRepository.find({
      where: [
        { corp: { corp_name: corpname }, is_del: false },
        { corp: { corp_name: corpname }, is_del: IsNull() },
      ],
      relations: ['userCareer'],
      order: {
        id: 'DESC',
      },
    });
    console.log(reviews);
    return reviews;
  }

  // 기관명으로 전현직 리뷰 평점 조회
  async getWorkingScore(corpname: string) {
    const result = await this.reviewRepository
      .createQueryBuilder('r')
      .select('AVG(r.total_score)', 'total_score')
      .addSelect('AVG(r.growth_score)', 'growth_score')
      .addSelect('AVG(r.leadership_score)', 'leadership_score')
      .addSelect('AVG(r.reward_score)', 'reward_score')
      .addSelect('AVG(r.worth_score)', 'worth_score')
      .addSelect('AVG(r.culture_score)', 'culture_score')
      .addSelect('AVG(r.worklife_score)', 'worklife_score')
      .where('r.corp_name = :corpname', { corpname })
      .andWhere('r.is_del IS NULL OR r.is_del <> 1')
      .getRawOne();
    console.log(result);

    return result;
  }

  // 전현직 리뷰 삭제
  async deleteWorkingReview(userId: string, deleteReviewDto: DeleteReviewDto) {
    if (userId != deleteReviewDto.user_id) {
      throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
    }
    const review = await this.reviewRepository.findOneBy({
      id: deleteReviewDto.review_no,
    });
    if (!review) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    const career = await this.userService.deleteCareer(deleteReviewDto.review_no);

    review.modified_date = new Date();
    review.is_del = true;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(review);
      await queryRunner.manager.save(career);
      await queryRunner.commitTransaction();
      return { msg: '삭제완료' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
      this.corpService.updateHashtag(review.corp.corp_name);
    }
  }

  // 실습리뷰 작성
  async createTrainingReview(trainingCreateDto: TrainingCreateDto) {
    if (!trainingCreateDto.corp) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const total_score =
      Math.round(
        ((trainingCreateDto.growth_score + trainingCreateDto.worth_score + trainingCreateDto.recommend_score + trainingCreateDto.supervisor_score) / 4) * 10,
      ) / 10;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const review = this.reviewTrainingRepository.create({ ...trainingCreateDto, total_score: total_score });
      const savedReview = await queryRunner.manager.save(review);
      await queryRunner.commitTransaction();
      return { review: savedReview };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // 기관명으로 실습 리뷰 조회
  async findTrainingReviews(corpname: string) {
    const reviews = await this.reviewTrainingRepository.find({
      where: [
        { corp: { corp_name: corpname }, is_del: false },
        { corp: { corp_name: corpname }, is_del: IsNull() },
      ],
      order: {
        id: 'DESC',
      },
    });
    return reviews;
  }

  // 기관명으로 실습 리뷰 평점 조회
  async getTrainingScore(corpname: string) {
    const result = await this.reviewTrainingRepository
      .createQueryBuilder('r')
      .select('AVG(r.total_score)', 'total_score')
      .addSelect('AVG(r.growth_score)', 'growth_score')
      .addSelect('AVG(r.worth_score)', 'worth_score')
      .addSelect('AVG(r.recommend_score)', 'recommend_score')
      .addSelect('AVG(r.supervisor_score)', 'supervisor_score')
      .where('r.corp_name = :corpname', { corpname })
      .andWhere('r.is_del IS NULL OR r.is_del <> 1')
      .getRawOne();

    return result;
  }

  // 실습 리뷰 삭제
  async deleteTrainingReview(userId: string, deleteReviewDto: DeleteReviewDto) {
    if (userId != deleteReviewDto.user_id) {
      throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
    }
    const review = await this.reviewTrainingRepository.findOneBy({
      id: deleteReviewDto.review_no,
    });
    if (!review) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    review.modified_date = new Date();
    review.is_del = true;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(review);
      await queryRunner.commitTransaction();
      return { msg: '삭제완료' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // 리뷰 좋아요
  async updateLike(likeDto: LikeDto) {
    if (likeDto.type == 'working') {
      const review = await this.reviewRepository.findOneBy({
        id: likeDto.review_no,
      });
      if (!review) {
        throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
      }

      if (likeDto.action === 'plus' || likeDto.action === 'minus') {
        review.likes += likeDto.action == 'plus' ? 1 : -1;
      }

      try {
        await this.reviewRepository.save(review);
        return review.likes;
      } catch (error) {
        throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
      }
    }
    if (likeDto.type == 'training') {
      const review = await this.reviewTrainingRepository.findOneBy({
        id: likeDto.review_no,
      });

      if (!review) {
        throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
      }

      if (likeDto.action === 'plus' || likeDto.action === 'minus') {
        review.likes += likeDto.action == 'plus' ? 1 : -1;
      }

      try {
        await this.reviewTrainingRepository.save(review);
        return review.likes;
      } catch (error) {
        throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
      }
    }
  }
}
