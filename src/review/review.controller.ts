import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { Response, response } from 'express';
import { ReviewWriteDto } from './dto/review-write.dto';
import { GetCurrentUser } from 'src/common/decorators';
import { WorkingCreateDto } from './dto/review-create.dto';
import { CorpService } from 'src/corp/corp.service';

@ApiTags('Review')
@Controller('/api/review')
export class ReviewController {
  constructor(
    private reviewService: ReviewService,
    private corpService: CorpService,
  ) {}

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

  @Post('/:name')
  @ApiOperation({})
  @ApiResponse({
    status: 201,
    description: '리뷰 작성',
  })
  create(@GetCurrentUser('id') userId: string, @Param('name') name: string, @Body() reviewWriteDto: ReviewWriteDto) {
    reviewWriteDto.corp_name = name;
    reviewWriteDto.user_id = userId;

    return this.reviewService.create(reviewWriteDto);
  }

  @Get('/corp/:corp')
  async viewReview(@Param('corp') corp: string, @Res() res: Response) {
    const corpData = await this.reviewService.findCorp(corp);
    if (!corpData) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    const reviewData = await this.reviewService.findReview(corp);

    res.status(HttpStatus.OK).render('view/review.detail.html');
  }
}
