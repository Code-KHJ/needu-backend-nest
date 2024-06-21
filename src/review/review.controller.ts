import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { GetCurrentUser, Public } from 'src/common/decorators';
import { WorkingCreateDto } from './dto/review-create.dto';
import { CorpService } from 'src/corp/corp.service';

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
  async createWorkingReview(@GetCurrentUser('id') userId: string, @Param('name') name: string, @Body() workingCreateDto: WorkingCreateDto) {
    const corp = await this.corpService.findOne(name);
    workingCreateDto.corp = corp;
    workingCreateDto.user_id = userId;

    const response = await this.reviewService.createWorkingReview(workingCreateDto);
    if (response.review.no == null || response.career.no == null) {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }
    return response;
  }

  @Patch('/working/:no')
  @ApiOperation({ summary: '전현직자 리뷰 수정' })
  @ApiResponse({
    status: 201,
    description: '전현직자 리뷰 수정',
  })
  async updateWorkingReview() {}

  @Delete('/working/:no')
  @ApiOperation({ summary: '전현직자 리뷰 삭제' })
  @ApiResponse({
    status: 201,
    description: '전현직자 리뷰 삭제',
  })
  async deleteWorkingReview() {}

  @Public()
  @Get('/working/:name')
  @ApiOperation({ summary: '전현직자 리뷰 조회' })
  @ApiResponse({
    status: 200,
    description: '전현직자 리뷰 조회',
  })
  async getWorkingReview() {}

  ///실습리뷰
  @Post('/training/:name')
  @ApiOperation({ summary: '실습 리뷰 작성' })
  @ApiResponse({
    status: 201,
    description: '실습 리뷰 작성',
  })
  async createTrainingReview() {}

  @Patch('/training/:no')
  @ApiOperation({ summary: '실습 리뷰 수정' })
  @ApiResponse({
    status: 201,
    description: '실습 리뷰 수정',
  })
  async updateTrainingReview() {}

  @Delete('/training/:no')
  @ApiOperation({ summary: '실습 리뷰 삭제' })
  @ApiResponse({
    status: 201,
    description: '실습 리뷰 삭제',
  })
  async deleteTrainingReview() {}

  @Public()
  @Get('/training/:name')
  @ApiOperation({ summary: '실습 리뷰 조회' })
  @ApiResponse({
    status: 200,
    description: '실습 리뷰 조회',
  })
  async getTrainingReview() {}
}
