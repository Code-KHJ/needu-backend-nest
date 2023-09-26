import { Controller, Get, HttpException, HttpStatus, Param, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { Response } from 'express';

@ApiTags('Review')
@Controller('/api/review')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

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
