import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entity/review.entity';
import { Corp } from '../entity/corp.entity';
import { Hashtag } from '../entity/hashtag.entity';
import { ReviewCreateDto } from './dto/review-create.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Corp)
    private readonly corpRepository: Repository<Corp>,
    @InjectRepository(Hashtag)
    private readonly hashtagRepository: Repository<Hashtag>,
  ) {}

  async create(reviewCreateDto: ReviewCreateDto) {
    const { corp_name } = reviewCreateDto;
    const corp = await this.corpRepository.findOneBy({ corp_name: corp_name });

    if (!corp) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const review = await this.reviewRepository.create(reviewCreateDto);
  }

  async findCorp(corpName: string) {
    const result = await this.corpRepository.findOneBy({
      corp_name: corpName,
    });
    return result;
  }

  async findReview(corpName: string) {
    const result = await this.reviewRepository.findOne({
      where: {
        corp_name: corpName,
      },
      order: {
        no: 'DESC',
      },
    });
    return result;
  }

  // async findHashtag(corpName: string) {
  //   const result = await this.hashtagRepository.find({
  //     where: {
  //       corp_name: corpName,
  //     },
  //   });
  // }
}
