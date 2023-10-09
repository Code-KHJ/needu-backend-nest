import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { Response } from 'express';
import { ReviewWriteDto } from './dto/review-write.dto';

@ApiTags('Review')
@Controller('/api/review')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Post('/:name')
  @ApiOperation({})
  @ApiResponse({
    status: 201,
    description: '리뷰 작성',
  })
  create(@Param('name') name: string, @Body() reviewWriteDto: ReviewWriteDto) {
    reviewWriteDto.corp_name = name;
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
