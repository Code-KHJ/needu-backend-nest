import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CareerType } from 'src/entity/career-type.entity';
import { ReviewHashtag } from 'src/entity/review-hashtag.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SharedService {
  constructor(
    @InjectRepository(CareerType)
    private readonly careerTypeRepository: Repository<CareerType>,
    @InjectRepository(ReviewHashtag)
    private readonly reviewHashtagRepository: Repository<ReviewHashtag>,
  ) {}

  async getCareerType() {
    const careerType = await this.careerTypeRepository.find();

    return careerType;
  }

  async getHashtag() {
    const hashtag = await this.reviewHashtagRepository.find();

    return hashtag;
  }
}
