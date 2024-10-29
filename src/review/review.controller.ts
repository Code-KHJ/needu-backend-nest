import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetCurrentUser, Public } from 'src/common/decorators';
import { CorpService } from 'src/corp/corp.service';
import { WorkingCreateDto } from './dto/review-create.dto';
import { DeleteReviewDto } from './dto/review-delete.dto';
import { LikeDto } from './dto/review-like.dto';
import { TrainingCreateDto } from './dto/review-training-create.dto';
import { ReviewService } from './review.service';

@ApiTags('Review')
@Controller('/api/review')
export class ReviewController {
  constructor(
    private reviewService: ReviewService,
    private corpService: CorpService,
  ) {}

  ///전현직 리뷰
  @Post('/working/:name')
  @ApiOperation({ summary: '전현직자 리뷰 작성' })
  @ApiResponse({
    status: 201,
    description: '전현직자 리뷰 작성',
  })
  async createWorkingReview(@GetCurrentUser('user_id') userId: string, @Param('name') name: string, @Body() workingCreateDto: WorkingCreateDto) {
    const corp = await this.corpService.findOne(name);
    workingCreateDto.corp = corp;
    workingCreateDto.user_id = userId;

    const response = await this.reviewService.createWorkingReview(workingCreateDto);
    if (response.review.id == null || response.career.id == null) {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }
    return response;
  }

  @Get('/working/user')
  @ApiOperation({ summary: '전현직자 리뷰 조회 by 유저' })
  @ApiResponse({
    status: 200,
    description: '전현직자 리뷰 조회',
  })
  async getWorkingReviewsByUser(@GetCurrentUser('user_id') userId: string) {
    const response = await this.reviewService.findWorkingReviewsByUser(userId);

    return response;
  }

  @Public()
  @Get('/working/recent')
  @ApiOperation({ summary: '전현직자 리뷰 최신순 조회' })
  @ApiResponse({
    status: 200,
    description: '전현직자 리뷰 최신순 조회',
  })
  async getWorkingReviewOrderByRecent() {
    const response = await this.reviewService.getWorkingReviewOrderByRecent();
    return response;
  }

  @Public()
  @Get('/working/:name')
  @ApiOperation({ summary: '전현직자 리뷰 조회 by 기관명' })
  @ApiResponse({
    status: 200,
    description: '전현직자 리뷰 조회',
  })
  async getWorkingReviews(@Param('name') name: string) {
    const response = await this.reviewService.findWorkingReviews(name);

    return response;
  }

  @Get('/working/id/:no')
  @ApiOperation({ summary: '전현직자 리뷰 조회 by 리뷰 no' })
  @ApiResponse({
    status: 200,
    description: '전현직자 리뷰 조회',
  })
  async getWorkingReview(@GetCurrentUser('user_id') userId: string, @Param('no') no: string) {
    const response = await this.reviewService.findWorkingReviewById(userId, no);

    return response;
  }

  @Patch('/working/id/:no')
  @ApiOperation({ summary: '전현직자 리뷰 수정' })
  @ApiResponse({
    status: 200,
    description: '전현직자 리뷰 수정',
  })
  async updateWorkingReview(@GetCurrentUser('user_id') userId: string, @Param('no') no: string, @Body() workingCreateDto: WorkingCreateDto) {
    const response = await this.reviewService.updateWorkingReview(no, userId, workingCreateDto);
    return response;
  }

  @Delete('/working')
  @ApiOperation({ summary: '전현직자 리뷰 삭제' })
  @ApiResponse({
    status: 200,
    description: '전현직자 리뷰 삭제',
  })
  async deleteWorkingReview(@GetCurrentUser('user_id') userId: string, @Body() deleteReviewDto: DeleteReviewDto) {
    const response = await this.reviewService.deleteWorkingReview(userId, deleteReviewDto);

    return response;
  }

  @Public()
  @Get('/working/score/:name')
  @ApiOperation({ summary: '전현직자 리뷰 점수 조회' })
  @ApiResponse({
    status: 200,
    description: '전현직자 리뷰 점수 조회',
  })
  async getWorkingScore(@Param('name') name: string) {
    const response = await this.reviewService.getWorkingScore(name);

    return response;
  }

  ///실습리뷰
  @Post('/training/:name')
  @ApiOperation({ summary: '실습 리뷰 작성' })
  @ApiResponse({
    status: 201,
    description: '실습 리뷰 작성',
  })
  async createTrainingReview(@GetCurrentUser('user_id') userId: string, @Param('name') name: string, @Body() trainingCreateDto: TrainingCreateDto) {
    const corp = await this.corpService.findOne(name);
    trainingCreateDto.corp = corp;
    trainingCreateDto.user_id = userId;
    const response = await this.reviewService.createTrainingReview(trainingCreateDto);
    if (!response.review.id) {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }
    return response;
  }

  @Get('/training/user')
  @ApiOperation({ summary: '실습 리뷰 조회 by 유저' })
  @ApiResponse({
    status: 200,
    description: '실습 리뷰 조회',
  })
  async getTrainingReviewsByUser(@GetCurrentUser('user_id') userId: string) {
    const response = await this.reviewService.findTrainingReviewsByUser(userId);

    return response;
  }

  @Public()
  @Get('/training/recent')
  @ApiOperation({ summary: '실습 리뷰 최신순 조회' })
  @ApiResponse({
    status: 200,
    description: '실습 리뷰 최신순 조회',
  })
  async getTrainingReviewOrderByRecent() {
    const response = await this.reviewService.getTrainingReviewOrderByRecent();
    return response;
  }

  @Public()
  @Get('/training/:name')
  @ApiOperation({ summary: '실습 리뷰 조회 by 기관명' })
  @ApiResponse({
    status: 200,
    description: '실습 리뷰 조회',
  })
  async getTrainingReviews(@Param('name') name: string) {
    const response = await this.reviewService.findTrainingReviews(name);

    return response;
  }

  @Public()
  @Get('/training/score/:name')
  @ApiOperation({ summary: '실습 리뷰 점수 조회' })
  @ApiResponse({
    status: 200,
    description: '실습 리뷰 점수 조회',
  })
  async getTrainingScore(@Param('name') name: string) {
    const response = await this.reviewService.getTrainingScore(name);

    return response;
  }

  @Get('/training/id/:no')
  @ApiOperation({ summary: '실습 리뷰 조회 by 리뷰 no' })
  @ApiResponse({
    status: 200,
    description: '실습 리뷰 조회',
  })
  async getTrainingReview(@GetCurrentUser('user_id') userId: string, @Param('no') no: string) {
    const response = await this.reviewService.findTrainingReviewById(userId, no);
    return response;
  }

  @Patch('/training/id/:no')
  @ApiOperation({ summary: '실습 리뷰 수정' })
  @ApiResponse({
    status: 200,
    description: '실습 리뷰 수정',
  })
  async updateTrainingReview(@GetCurrentUser('user_id') userId: string, @Param('no') no: string, @Body() trainingCreateDto: TrainingCreateDto) {
    const response = await this.reviewService.updateTrainingReview(no, userId, trainingCreateDto);
    return response;
  }

  @Delete('/training')
  @ApiOperation({ summary: '실습 리뷰 삭제' })
  @ApiResponse({
    status: 200,
    description: '실습 리뷰 삭제',
  })
  async deleteTrainingReview(@GetCurrentUser('user_id') userId: string, @Body() deleteReviewDto: DeleteReviewDto) {
    const response = await this.reviewService.deleteTrainingReview(userId, deleteReviewDto);

    return response;
  }

  // 리뷰 좋아요
  @Patch('/like')
  @ApiOperation({ summary: '리뷰 좋아요' })
  @ApiResponse({
    status: 201,
    description: '리뷰 좋아요',
  })
  async updateLike(@GetCurrentUser('id') userId: number, @Body() likeDto: LikeDto) {
    const response = await this.reviewService.updateLike(userId, likeDto);

    return response;
  }
}
