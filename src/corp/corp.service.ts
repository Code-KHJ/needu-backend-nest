import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { Review } from 'src/entity/review.entity';
import { FindManyOptions, Like, MoreThan, Repository } from 'typeorm';
import { Corp } from '../entity/corp.entity';
import { CorpCreateDto } from './dto/corp-create.dto';
import { CorpUpdateDto } from './dto/corp-update.dto';
import { CorpsGetResponseDto } from './dto/corps-get-response.dto';
import { CorpsGetTrainingDto } from './dto/corps-get-training.dto';
import { CorpsGetTrainingResponseDto } from './dto/corps-get-traininging-response.dto';
import { CorpsGetWorkingResponseDto } from './dto/corps-get-working-response.dto';
import { CorpsGetWorkingDto } from './dto/corps-get-working.dto';
import { CorpsGetDto } from './dto/corps-get.dto';

@Injectable()
export class CorpService {
  constructor(
    @InjectRepository(Corp)
    private readonly corpRepository: Repository<Corp>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  async findAll(corpsGetDto: CorpsGetDto) {
    let { name, city, gugun, score, hashtag, order, page } = corpsGetDto;
    const take = 10;
    if (page === undefined) {
      page = 1;
    }
    const skip = (page - 1) * take;

    if (name === undefined) {
      name = '';
    }
    if (city === undefined) {
      city = '';
    }
    if (gugun === undefined) {
      gugun = '';
    }

    //default option
    let options: FindManyOptions<Corp> = {
      where: {
        corp_name: Like(`%${name}%`),
        city: Like(`%${city}%`),
        gugun: Like(`%${gugun}%`),
      },
      take,
      skip,
      order: { id: 'ASC' },
    };

    if (!score) {
      options = {
        where: {
          corp_name: Like(`%${name}%`),
          city: Like(`%${city}%`),
          gugun: Like(`%${gugun}%`),
        },
        take,
        skip,
        order: { id: 'ASC' },
      };
      return;
    }

    const corps = await this.corpRepository.find(options);
    const result: CorpsGetResponseDto[] = [];

    for (const corp of corps) {
      const postItem = new CorpsGetResponseDto(corp.id, corp.corp_name, corp.city, corp.gugun);
      result.push(postItem);
    }

    return result;
  }

  async findOne(name: string) {
    const corp = await this.corpRepository.findOneBy({ corp_name: name });
    if (!corp) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    return corp;
  }

  //기관 조회 with 전현직 리뷰 평점, 필터
  async findAllWorking(corpsGetWorkingDto: CorpsGetWorkingDto) {
    let { corp_name, region, score, hashtags, order, page } = corpsGetWorkingDto;
    const take = 10;
    if (page === undefined) {
      page = 1;
    }
    const skip = (page - 1) * take;

    if (corp_name === undefined) {
      corp_name = '';
    }
    if (region === undefined) {
      region = '';
    }
    if (order === undefined) {
      order = 'avg';
    }

    const queryBuilder = await this.corpRepository
      .createQueryBuilder('c')
      .select(['c.id AS id', 'c.corp_name AS corp_name', 'c.city AS city', 'c.gugun AS gugun', 'c.hashtag AS hashtag'])
      .leftJoin('c.reviews', 'rp')
      .addSelect([
        'COUNT(CASE WHEN rp.is_del = 0 THEN rp.id ELSE NULL END) AS cnt',
        'ROUND(AVG(CASE WHEN rp.is_del = 0 THEN rp.total_score ELSE NULL END),1) as avg',
      ])
      .where('c.corp_name LIKE :name', { name: `%${corp_name}%` })
      .andWhere('c.city LIKE :city', { city: `%${region}%` });

    let havingClause;
    let params = {};
    if (score !== undefined && score !== '') {
      const scoreList = score.split(',').map(Number);
      const havingClauses = scoreList.map(s => {
        return `avg >= :minScore${s} AND avg < :maxScore${s}`;
      });

      // 실제로 사용할 having 절 문자열 생성
      havingClause = havingClauses.join(' OR ');

      // 매개변수 객체 생성
      scoreList.forEach(s => {
        params[`minScore${s}`] = s;
        params[`maxScore${s}`] = s + 1;
      });
    }
    if (hashtags !== undefined && hashtags !== '') {
      const hashtagArray = hashtags.split(',').map(Number);
      hashtagArray.forEach((hashtag, index) => {
        queryBuilder.andWhere(`JSON_CONTAINS(c.hashtag, :hashtag${index})`, { [`hashtag${index}`]: `[${hashtag}]` });
      });
    }
    if (havingClause) {
      queryBuilder.having(havingClause, params);
    }

    const totalCount = await queryBuilder.groupBy('c.corp_name').getRawMany();
    const corps = await queryBuilder
      .groupBy('c.corp_name')
      .orderBy(order, 'DESC')
      .addOrderBy(order === 'avg' ? 'cnt' : 'avg', 'DESC')
      .addOrderBy('c.corp_name', 'ASC')
      .offset(skip)
      .limit(take)
      .getRawMany();

    const totalPages = Math.ceil(totalCount.length / take); // 총 페이지 수 계산

    const result: CorpsGetWorkingResponseDto[] = [];

    for (const corp of corps) {
      const postItem = new CorpsGetWorkingResponseDto(corp.id, corp.corp_name, corp.city, corp.gugun, corp.hashtag, corp.cnt, corp.avg);
      result.push(postItem);
    }
    return { result, totalPages };
  }

  //기관 단일 조회 with 전현직 리뷰 평점
  async findOneWorking(name: string) {
    const corp = await this.corpRepository
      .createQueryBuilder('c')
      .select(['c.id AS no', 'c.corp_name AS corp_name', 'c.city AS city', 'c.gugun AS gugun', 'c.hashtag AS hashtag'])
      .leftJoin('c.reviews', 'rp')
      .addSelect([
        'COUNT(CASE WHEN rp.is_del = 0 THEN rp.id ELSE NULL END) AS cnt',
        'ROUND(AVG(CASE WHEN rp.is_del = 0 THEN rp.total_score ELSE NULL END),1) AS avg',
      ])
      .where('c.corp_name = :name', { name: name })
      .groupBy('c.corp_name')
      .getRawOne();

    return corp;
  }

  //기관 조회 with 실습 리뷰 평점, 필터
  async findAllTraining(corpsGetTrainingDto: CorpsGetTrainingDto) {
    let { corp_name, region, score, number_of_participants, cost, duration, order, page } = corpsGetTrainingDto;
    const take = 10;
    if (page === undefined) {
      page = 1;
    }
    const skip = (page - 1) * take;

    if (corp_name === undefined) {
      corp_name = '';
    }
    if (region === undefined) {
      region = '';
    }
    if (order === undefined) {
      order = 'avg';
    }

    const queryBuilder = await this.corpRepository
      .createQueryBuilder('c')
      .select(['c.id AS id', 'c.corp_name AS corp_name', 'c.city AS city', 'c.gugun AS gugun', 'c.hashtag AS hashtag'])
      .leftJoin('c.reviews_training', 'r')
      .addSelect([
        'COUNT(CASE WHEN r.is_del = 0 THEN r.id ELSE NULL END) AS cnt',
        'ROUND(AVG(CASE WHEN r.is_del  = 0 THEN r.total_score ELSE NULL END),1) as avg',
        'ROUND(AVG(CASE WHEN r.is_del  = 0 THEN r.number_of_participants ELSE NULL END),1) as number_of_participants',
        'ROUND(AVG(CASE WHEN r.is_del  = 0 THEN r.cost/10000 ELSE NULL END),1) as cost',
        'ROUND(AVG(CASE WHEN r.is_del  = 0 THEN r.duration ELSE NULL END),1) as duration',
      ])
      .where('c.corp_name LIKE :name', { name: `%${corp_name}%` })
      .andWhere('c.city LIKE :city', { city: `%${region}%` });

    let havingClauses = [];
    if (score !== undefined && score !== '') {
      const scoreList = score.split(',').map(Number);
      const scoreConditions = [];
      // 매개변수 객체 생성
      scoreList.forEach(s => {
        scoreConditions.push(`(avg >= ${s} AND avg < ${s + 1})`);
      });
      const scoreClause = `(${scoreConditions.join(' OR ')})`;
      havingClauses.push(scoreClause);
    }
    if (number_of_participants !== '') {
      const list = number_of_participants.split(',').map(Number);
      const peopleConditions = [];
      list.map(item => {
        switch (item) {
          case 0:
            peopleConditions.push('(number_of_participants >= 1 AND number_of_participants < 4)');
            break;
          case 1:
            peopleConditions.push('(number_of_participants >= 4 AND number_of_participants < 7)');
            break;
          case 2:
            peopleConditions.push('(number_of_participants >= 7 AND number_of_participants < 10)');
            break;
          case 3:
            peopleConditions.push('(number_of_participants >= 10 AND number_of_participants < 13)');
            break;
          case 4:
            peopleConditions.push('(number_of_participants >= 13)');
            break;
          default:
            break;
        }
      });
      const peopleClause = `(${peopleConditions.join(' OR ')})`;
      havingClauses.push(peopleClause);
    }
    if (cost !== '') {
      const list = cost.split(',').map(Number);
      const costConditions = [];
      list.map(item => {
        switch (item) {
          case 0:
            costConditions.push('(cost < 10)');
            break;
          case 1:
            costConditions.push('(cost >= 10 AND cost < 15)');
            break;
          case 2:
            costConditions.push('(cost >= 15 AND cost < 20)');
            break;
          case 3:
            costConditions.push('(cost >= 20)');
            break;
          default:
            break;
        }
      });
      const costClause = `(${costConditions.join(' OR ')})`;
      havingClauses.push(costClause);
    }
    ['160시간 미만', '160-200시간', '200시간 이상'];
    if (duration !== '') {
      const list = duration.split(',').map(Number);
      const durationConditions = [];
      list.map(item => {
        switch (item) {
          case 0:
            durationConditions.push('(duration < 160)');
            break;
          case 1:
            durationConditions.push('(duration >= 160 AND duration < 200)');
            break;
          case 2:
            durationConditions.push('(duration >= 200)');
            break;
          default:
            break;
        }
      });
      const durationClause = `(${durationConditions.join(' OR ')})`;
      havingClauses.push(durationClause);
    }

    if (havingClauses.length > 0) {
      const finalHavingClause = `(${havingClauses.join(') AND (')})`;
      queryBuilder.having(finalHavingClause);
    }

    const totalCount = await queryBuilder.groupBy('c.corp_name').getRawMany();
    const corps = await queryBuilder
      .groupBy('c.corp_name')
      .orderBy(order, 'DESC')
      .addOrderBy(order === 'avg' ? 'cnt' : 'avg', 'DESC')
      .addOrderBy('c.corp_name', 'ASC')
      .offset(skip)
      .limit(take)
      .getRawMany();

    const totalPages = Math.ceil(totalCount.length / take); // 총 페이지 수 계산
    const result: CorpsGetTrainingResponseDto[] = [];
    for (const corp of corps) {
      const postItem = new CorpsGetTrainingResponseDto(
        corp.id,
        corp.corp_name,
        corp.city,
        corp.gugun,
        corp.hashtag,
        corp.number_of_participants,
        corp.cost,
        corp.duration,
        corp.cnt,
        corp.avg,
      );
      result.push(postItem);
    }
    return { result, totalPages };
  }

  //기관 단일 조회 with 실습 리뷰 평점
  async findOneTraining(name: string) {
    const corp = await this.corpRepository
      .createQueryBuilder('c')
      .select(['c.id AS no', 'c.corp_name AS corp_name', 'c.city AS city', 'c.gugun AS gugun', 'c.hashtag AS hashtag'])
      .leftJoin('c.reviews_training', 'rt')
      .addSelect([
        'COUNT(CASE WHEN rt.is_del  = 0 THEN rt.id ELSE NULL END) AS cnt',
        'ROUND(AVG(CASE WHEN rt.is_del  = 0 THEN rt.total_score ELSE NULL END),1) AS avg',
      ])
      .where('c.corp_name = :name', { name: name })
      .groupBy('c.corp_name')
      .getRawOne();

    return corp;
  }

  async create(corpCreateDto: CorpCreateDto) {
    try {
      const corp = await this.corpRepository.create(corpCreateDto);
      await this.corpRepository.save(corp);
      return corp;
    } catch (error) {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }
  }

  async update(corpUpdateDto: CorpUpdateDto) {
    //권한 확인

    const { corp_name } = corpUpdateDto;
    const corp = await this.corpRepository.findOneBy({ corp_name: corp_name });

    if (!corp) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    for (const [key, value] of Object.entries(corpUpdateDto)) {
      if (value !== undefined) {
        corp[key] = value;
      }
    }

    try {
      await this.corpRepository.save(corp);
      return corp;
    } catch (error) {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }
  }

  async delete(name: string) {
    //권한 확인

    const corpName = name;
    const corp = await this.corpRepository.findOneBy({ corp_name: corpName });

    if (!corp) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    try {
      await this.corpRepository.remove(corp);
      return '기관 삭제 완료';
    } catch (err) {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }
  }

  //전현직 리뷰 작성, 수정 시 기관 해시태그 업데이트
  async updateHashtag(name: string) {
    const corp = await this.findOne(name);
    const reviews = await this.reviewRepository
      .createQueryBuilder('review')
      .leftJoin('review.corp', 'corp')
      .select(['corp.corp_name', 'review.hashtag'])
      .where('corp.corp_name = :corpName', { corpName: corp.corp_name })
      .getMany();

    const combinedHashtags = reviews.reduce((accumulator, review) => {
      accumulator.push(...review.hashtag);
      return accumulator;
    }, []);

    const counts = combinedHashtags.reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {});
    const hashtags = Object.entries(counts)
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .map(entry => Number(entry[0]));

    corp.hashtag = hashtags;

    return await this.corpRepository.save(corp);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async setHotList() {
    const corpsWithWorking = await this.corpRepository.find({
      where: { reviews: MoreThan(0) },
      relations: ['reviews', 'reviews_training'],
    });
    const corpsWithTraining = await this.corpRepository.find({
      where: { reviews_training: MoreThan(0) },
      relations: ['reviews', 'reviews_training'],
    });
    const combinedCorps = [...corpsWithTraining, ...corpsWithWorking];
    const uniqueCorps = combinedCorps.filter((corp, index, self) => index === self.findIndex(c => c.id === corp.id)).slice(0, 10);
    const corpList = uniqueCorps.map(corp => {
      const averageScores = {
        workinkg: {
          total_score: 0,
          growth_score: 0,
          leadership_score: 0,
          reward_score: 0,
          worth_score: 0,
          culture_score: 0,
          worklife_score: 0,
        },
        training: {
          total_score: 0,
          growth_score: 0,
          worth_score: 0,
          recommend_score: 0,
          supervisor_score: 0,
        },
      };
      corp.reviews.forEach(review => {
        averageScores.workinkg.total_score += Number(review.total_score);
        averageScores.workinkg.growth_score += Number(review.growth_score);
        averageScores.workinkg.leadership_score += Number(review.leadership_score);
        averageScores.workinkg.reward_score += Number(review.reward_score);
        averageScores.workinkg.worth_score += Number(review.worth_score);
        averageScores.workinkg.culture_score += Number(review.culture_score);
        averageScores.workinkg.worklife_score += Number(review.worklife_score);
      });
      corp.reviews_training.forEach(review => {
        averageScores.training.total_score += Number(review.total_score);
        averageScores.training.growth_score += Number(review.growth_score);
        averageScores.training.recommend_score += Number(review.recommend_score);
        averageScores.training.supervisor_score += Number(review.supervisor_score);
        averageScores.training.worth_score += Number(review.worth_score);
      });

      for (const key in averageScores.workinkg) {
        averageScores.workinkg[key] /= corp.reviews.length;
      }
      for (const key in averageScores.training) {
        averageScores.training[key] /= corp.reviews_training.length;
      }

      let criteria = 'default';
      let type = 'working';
      if (averageScores.workinkg.total_score === 5) {
        criteria = 'working5';
        type = 'working';
      } else if (averageScores.training.total_score === 5) {
        criteria = 'training5';
        type = 'training';
      } else if (averageScores.workinkg.total_score >= 4) {
        criteria = 'working4';
        type = 'working';
      } else if (averageScores.training.total_score >= 4) {
        criteria = 'training4';
        type = 'training';
      } else if (averageScores.workinkg.growth_score >= 4) {
        criteria = 'growth';
        type = 'working';
      } else if (averageScores.training.growth_score >= 4) {
        criteria = 'growth';
        type = 'training';
      } else if (averageScores.workinkg.worth_score >= 4) {
        criteria = 'worth';
        type = 'working';
      } else if (averageScores.training.worth_score >= 4) {
        criteria = 'worth';
        type = 'training';
      } else if (averageScores.workinkg.leadership_score >= 4) {
        criteria = 'leadership';
        type = 'working';
      } else if (averageScores.workinkg.reward_score >= 4) {
        criteria = 'reward';
        type = 'working';
      } else if (averageScores.workinkg.culture_score >= 4) {
        criteria = 'culture';
        type = 'working';
      } else if (averageScores.workinkg.worklife_score >= 4) {
        criteria = 'worklife';
        type = 'working';
      } else if (averageScores.training.recommend_score >= 4) {
        criteria = 'recommend';
        type = 'training';
      } else if (averageScores.training.supervisor_score >= 4) {
        criteria = 'supervisor';
        type = 'training';
      } else if (corp.reviews.length >= 5) {
        criteria = 'workingReviews';
        type = 'working';
      } else if (corp.reviews_training.length >= 5) {
        criteria = 'trainingReviews';
        type = 'training';
      }
      const review = {
        id: corp.id,
        corpname: corp.corp_name,
        criteria: criteria,
        score: averageScores,
        cnt: { working: corp.reviews.length, training: corp.reviews_training.length },
        type: type,
      };
      return review;
    });
    const today = new Date().toLocaleDateString();
    const redisKey = `${today} HotCorpList`;
    this.redis.set(redisKey, JSON.stringify(corpList), 'EX', 86400);
  }
  async getHotList() {
    const today = new Date().toLocaleDateString();
    const redisKey = `${today} HotCorpList`;
    const corpList = await this.redis.get(redisKey);
    if (!corpList) {
      await this.setHotList();
      const corpList = await this.redis.get(redisKey);
      return JSON.parse(corpList);
    }
    return JSON.parse(corpList);
  }

  async dump() {
    const corpList = await this.corpRepository.find({
      select: ['id', 'corp_name', 'city', 'gugun'],
    });
    return corpList;
  }
}
