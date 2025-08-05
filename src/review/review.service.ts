import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { CorpService } from 'src/corp/corp.service';
import { ReviewLike } from 'src/entity/review-like.entity';
import { ReviewTrainingLike } from 'src/entity/review-training-like.entity';
import { ReviewTraning } from 'src/entity/review-training.entity';
import { UserCareer } from 'src/entity/user-career.entity';
import { User } from 'src/entity/user.entity';
import { SharedService } from 'src/shared/shared.service';
import { CareerCreateDto } from 'src/user/dto/career-create.dto';
import { UserService } from 'src/user/user.service';
import { UtilService } from 'src/util/util.service';
import { DataSource, EntityManager, IsNull, Repository } from 'typeorm';
import { Review } from '../entity/review.entity';
import { CommonReviewsGetResponseDto } from './dto/common-review-get-response.dto';
import { WorkingCreateDto } from './dto/review-create.dto';
import { DeleteReviewDto } from './dto/review-delete.dto';
import { ReviewsGetResponseDto } from './dto/review-get-response.dto';
import { LikeDto } from './dto/review-like.dto';
import { TrainingCreateDto } from './dto/review-training-create.dto';
import { ReviewsTrainingGetResponseDto } from './dto/review-training-get-response.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(ReviewTraning)
    private readonly reviewTrainingRepository: Repository<ReviewTraning>,
    @InjectRepository(ReviewLike)
    private readonly reviewLikeRepository: Repository<ReviewLike>,
    @InjectRepository(ReviewTrainingLike)
    private readonly reviewTrainingLikeRepository: Repository<ReviewTrainingLike>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly corpService: CorpService,
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
    private readonly utilService: UtilService,
    private readonly sharedService: SharedService,
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

    const slackMsg = `
=======신규 전현직 리뷰=======
기관명 : ${workingCreateDto.corp_name}
작성자 : ${workingCreateDto.user_id}
별점 : ${total_score}
한줄평 : ${workingCreateDto.highlight}
장점 : ${workingCreateDto.pros}
단점 : ${workingCreateDto.cons}
`;
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
      const savedCareer = await queryRunner.manager.save(career);

      const user = await this.userRepository.findOne({ where: { user_id: workingCreateDto.user_id } });
      if (user.authority === 0) {
        user.authority = 1;
      }
      await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();

      this.utilService.slackWebHook('alert', slackMsg);
      const findReview = await this.reviewRepository.findOne({ where: { id: savedReview.id }, relations: ['user'] });
      this.sharedService.addPoint(findReview.user.id, 3, `working${savedReview.id}`);

      return { review: savedReview, career: savedCareer };
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
      relations: ['userCareer', 'reviewLikes', 'user'],
      order: {
        id: 'DESC',
      },
    });
    const reviewsDto = reviews.map(review => new ReviewsGetResponseDto(review));

    return reviewsDto;
  }

  // 유저 전현직 리뷰 조회
  async findWorkingReviewsByUser(userId: string) {
    const reviews = await this.reviewRepository.find({
      where: [
        { user_id: userId, is_del: false },
        { user_id: userId, is_del: IsNull() },
      ],
      relations: ['userCareer', 'reviewLikes', 'user', 'corp'],
      order: {
        id: 'DESC',
      },
    });
    const reviewsDto = reviews.map(review => new ReviewsGetResponseDto(review));

    return reviewsDto;
  }

  async getWorkingReviewOrderByRecent() {
    const reviews = await this.reviewRepository.find({
      where: [
        { is_del: false, blind: 1 },
        { is_del: IsNull(), blind: 1 },
      ],
      relations: ['corp'],
      order: {
        created_date: 'DESC',
      },
      take: 10,
    });
    const result = reviews.map(review => new CommonReviewsGetResponseDto({ ...review, type: '전현직' }));
    return result;
  }

  // 리뷰 no 으로 전현직 리뷰 조회
  async findWorkingReviewById(user_id: string, no: string) {
    const review = await this.reviewRepository.findOne({
      where: { id: parseInt(no) },
      relations: ['userCareer'],
    });
    if (user_id !== review.user_id) {
      throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
    }

    return review;
  }

  // 전현직 리뷰 수정
  async updateWorkingReview(no: string, userId: string, workingCreateDto: WorkingCreateDto) {
    if (userId != workingCreateDto.user_id) {
      throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
    }
    const review = await this.reviewRepository.findOne({
      where: { id: parseInt(no) },
    });
    const userCareer = await this.userService.getCareer(parseInt(no));
    const today = new Date();

    if (!review) {
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

    const reviewFields = Object.keys(review);
    const reviewdDto: Partial<WorkingCreateDto> = {};
    for (const key of Object.keys(workingCreateDto)) {
      if (reviewFields.includes(key)) {
        reviewdDto[key] = workingCreateDto[key];
      }
    }

    const careerDto = {
      first_date: workingCreateDto.start_date,
      last_date: workingCreateDto.end_date,
      type: workingCreateDto.career_type,
    };

    const queryRunner = await this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.merge(Review, review, { ...reviewdDto, total_score: total_score, modified_date: today });
      const updatedReview = await queryRunner.manager.save(review);

      await queryRunner.manager.merge(UserCareer, userCareer, { ...careerDto });
      const updatedCareer = await queryRunner.manager.save(userCareer);

      await queryRunner.commitTransaction();
      return { review: updatedReview, career: updatedCareer };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
      this.corpService.updateHashtag(review.corp.corp_name);
    }
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
      .andWhere('r.is_del = 0')
      .getRawOne();

    return result;
  }

  // 전현직 리뷰 삭제
  async deleteWorkingReview(userId: string, deleteReviewDto: DeleteReviewDto) {
    if (userId != deleteReviewDto.user_id) {
      throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
    }
    const review = await this.reviewRepository.findOne({ where: { id: deleteReviewDto.review_no }, relations: ['user'] });
    if (!review) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    const career = await this.userService.getCareer(deleteReviewDto.review_no);

    review.modified_date = new Date();
    review.is_del = true;
    career.is_del = true;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(review);
      await queryRunner.manager.save(career);
      await queryRunner.commitTransaction();

      this.sharedService.revokePoint(review.user.id, 3, `working${review.id}`);

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

    const slackMsg = `
=======신규 실습 리뷰=======
기관명 : ${trainingCreateDto.corp_name}
작성자 : ${trainingCreateDto.user_id}
별점 : ${total_score}
한줄평 : ${trainingCreateDto.highlight}
장점 : ${trainingCreateDto.pros}
단점 : ${trainingCreateDto.cons}
`;
    try {
      const review = this.reviewTrainingRepository.create({ ...trainingCreateDto, total_score: total_score });
      const savedReview = await queryRunner.manager.save(review);

      const user = await this.userRepository.findOne({ where: { user_id: trainingCreateDto.user_id } });
      if (user.authority === 0) {
        user.authority = 1;
      }

      await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();

      this.utilService.slackWebHook('alert', slackMsg);
      const findReview = await this.reviewTrainingRepository.findOne({ where: { id: savedReview.id }, relations: ['user'] });
      this.sharedService.addPoint(findReview.user.id, 3, `training${savedReview.id}`);

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
      relations: ['reviewTrainingLikes', 'user'],
      order: {
        id: 'DESC',
      },
    });
    const reviewsDto = reviews.map(review => new ReviewsTrainingGetResponseDto(review));

    return reviewsDto;
  }

  // 유저 전현직 리뷰 조회
  async findTrainingReviewsByUser(userId: string) {
    const reviews = await this.reviewTrainingRepository.find({
      where: [
        { user_id: userId, is_del: false },
        { user_id: userId, is_del: IsNull() },
      ],
      relations: ['reviewTrainingLikes', 'user'],
      order: {
        id: 'DESC',
      },
    });
    const reviewsDto = reviews.map(review => new ReviewsTrainingGetResponseDto(review));

    return reviewsDto;
  }

  async getTrainingReviewOrderByRecent() {
    const reviews = await this.reviewTrainingRepository.find({
      where: [
        { is_del: false, blind: 1 },
        { is_del: IsNull(), blind: 1 },
      ],
      relations: ['corp'],
      order: {
        created_date: 'DESC',
      },
      take: 10,
    });
    const result = reviews.map(review => new CommonReviewsGetResponseDto({ ...review, type: '실습' }));
    return result;
  }

  // 리뷰 no 으로 실습 리뷰 조회
  async findTrainingReviewById(user_id: string, no: string) {
    const review = await this.reviewTrainingRepository.findOne({
      where: { id: parseInt(no) },
    });
    if (user_id !== review.user_id) {
      throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
    }

    return review;
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
      .andWhere('r.is_del = 0')
      .getRawOne();

    return result;
  }

  // 실습 리뷰 수정
  async updateTrainingReview(no: string, userId: string, trainingCreateDto: TrainingCreateDto) {
    if (userId != trainingCreateDto.user_id) {
      throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
    }
    const review = await this.reviewTrainingRepository.findOne({
      where: { id: parseInt(no) },
    });
    const today = new Date();

    if (!review) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const total_score =
      Math.round(
        ((trainingCreateDto.growth_score + trainingCreateDto.worth_score + trainingCreateDto.recommend_score + trainingCreateDto.supervisor_score) / 4) * 10,
      ) / 10;

    const reviewFields = Object.keys(review);
    const reviewdDto: Partial<WorkingCreateDto> = {};
    for (const key of Object.keys(trainingCreateDto)) {
      if (reviewFields.includes(key)) {
        reviewdDto[key] = trainingCreateDto[key];
      }
    }

    const queryRunner = await this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.merge(ReviewTraning, review, { ...reviewdDto, total_score: total_score, modified_date: today });
      const updatedReview = await queryRunner.manager.save(review);

      await queryRunner.commitTransaction();
      return { review: updatedReview };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // 실습 리뷰 삭제
  async deleteTrainingReview(userId: string, deleteReviewDto: DeleteReviewDto) {
    if (userId != deleteReviewDto.user_id) {
      throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
    }
    const review = await this.reviewTrainingRepository.findOne({
      where: {
        id: deleteReviewDto.review_no,
      },
      relations: ['user'],
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

      this.sharedService.revokePoint(review.user.id, 3, `training${review.id}`);

      return { msg: '삭제완료' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // 리뷰 좋아요
  async updateLike(userId: number, likeDto: LikeDto) {
    if (likeDto.type === 'working') {
      if (likeDto.action === 'plus') {
        const result = await this.reviewLikeRepository.create({
          review_id: likeDto.review_no,
          user_id: userId,
        });
        await this.reviewLikeRepository.save(result);
        return { msg: '좋아요' };
      }
      if (likeDto.action === 'minus') {
        const result = await this.reviewLikeRepository.findOne({
          where: {
            user_id: userId,
            review_id: likeDto.review_no,
          },
        });
        await this.reviewLikeRepository.remove(result);
        return { msg: '좋아요 취소' };
      }
    }
    if (likeDto.type === 'training') {
      if (likeDto.action === 'plus') {
        const result = await this.reviewTrainingLikeRepository.create({
          review_id: likeDto.review_no,
          user_id: userId,
        });
        await this.reviewTrainingLikeRepository.save(result);
        return { msg: '좋아요' };
      }
      if (likeDto.action === 'minus') {
        const result = await this.reviewTrainingLikeRepository.findOne({
          where: {
            user_id: userId,
            review_id: likeDto.review_no,
          },
        });
        await this.reviewTrainingLikeRepository.remove(result);
        return { msg: '좋아요 취소' };
      }
    }
  }
}
