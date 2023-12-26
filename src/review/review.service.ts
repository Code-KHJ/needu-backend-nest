import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, getManager } from 'typeorm';
import { Review } from '../entity/review.entity';
import { Corp } from '../entity/corp.entity';
import { Hashtag } from '../entity/hashtag.entity';
import { ReviewCreateDto } from './dto/review-create.dto';
import { ReviewWriteDto } from './dto/review-write.dto';
import { hash } from 'bcrypt';
import { CorpService } from 'src/corp/corp.service';
import { CorpUpdateDto } from 'src/corp/dto/corp-update.dto';

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
    private corpService: CorpService,
  ) {}

  async create(reviewWriteDto: ReviewWriteDto) {
    const { corp_name } = reviewWriteDto;
    const corp = await this.corpRepository.findOneBy({ corp_name: corp_name });

    if (!corp) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const total_score =
      Math.round(
        ((reviewWriteDto.growth_score +
          reviewWriteDto.leadership_score +
          reviewWriteDto.reward_score +
          reviewWriteDto.worth_score +
          reviewWriteDto.culture_score +
          reviewWriteDto.worklife_score) /
          6) *
          10,
      ) / 10;

    //리뷰 create
    const review = this.reviewRepository.create({ ...reviewWriteDto, total_score: total_score });
    const savedReview = await this.reviewRepository.save(review);

    //해시태그 create
    const hashtag = this.hashtagRepository.create({ ...reviewWriteDto, review_no: savedReview.no });
    this.hashtagRepository.save(hashtag);

    //해시태그, 리뷰 데이터 GET
    const topHashtag = await this.getTopHashtagByCorp(corp_name);
    const rdCorp = await this.getReviewDataByCorp(corp_name);

    const corpUpdateDto = { ...topHashtag, ...rdCorp, corp_name: corp_name };
    console.log(corpUpdateDto);
    //Corp Update
    this.corpService.update(corpUpdateDto);
    // this.updateCorp(corp_name, topHashtag, rdCorp);
  }

  async findCorp(corpName: string) {
    const corp = await this.corpRepository.findOneBy({
      corp_name: corpName,
    });
    return corp;
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

  async getTopHashtagByCorp(corpName: string) {
    const subQueries = [];

    for (let i = 1; i <= 16; i++) {
      const subQuery = this.entityManager
        .createQueryBuilder()
        .select(`hashtag_${i}`, 'hash')
        .from('Hashtag_Posts', 'HP')
        .leftJoin('Review_Posts', 'RP', 'HP.review_no = RP.No')
        .where('RP.Corp_name = :corpName')
        .getQuery();

      subQueries.push(subQuery);
    }

    const mainQuery = await this.entityManager
      .createQueryBuilder()
      .select('hash')
      .from(`(${subQueries.join(' UNION ALL ')})`, 'hashtag')
      .groupBy('hash')
      .orderBy('COUNT(hash)', 'DESC')
      .limit(4)
      .setParameter('corpName', corpName)
      .getRawMany();

    const hashtagData = {
      hashtag_top1: mainQuery[0].hash,
      hashtag_top2: mainQuery[1].hash,
      hashtag_top3: mainQuery[2].hash,
      hashtag_top4: mainQuery[3].hash,
    };

    return hashtagData;
  }

  async getReviewDataByCorp(corpName: string) {
    const reviewData = await this.entityManager
      .createQueryBuilder()
      .select('ROUND(AVG(RP.total_score),1)', 'score')
      .addSelect('COUNT(*)', 'review_cnt')
      .from('Review_Posts', 'RP')
      .where('Corp_name = :corpName', { corpName })
      .getRawOne();

    return reviewData;
  }
}
