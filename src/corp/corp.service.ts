import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Corp } from '../entity/corp.entity';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { CorpsGetDto } from './dto/corps-get.dto';
import { CorpsGetResponseDto } from './dto/corps-get-response.dto';
import { CorpCreateDto } from './dto/corp-create.dto';
import { CorpUpdateDto } from './dto/corp-update.dto';
import { CorpsGetWorkingDto } from './dto/corps-get-working.dto';
import { Review } from 'src/entity/review.entity';
import { CorpsGetWorkingResponseDto } from './dto/corps-get-working-response.dto copy';

@Injectable()
export class CorpService {
  constructor(
    @InjectRepository(Corp)
    private readonly corpRepository: Repository<Corp>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
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
      order: { no: 'ASC' },
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
        order: { no: 'ASC' },
      };
      return;
    }

    const corps = await this.corpRepository.find(options);
    const result: CorpsGetResponseDto[] = [];

    for (const corp of corps) {
      const postItem = new CorpsGetResponseDto(corp.no, corp.corp_name, corp.city, corp.gugun);
      result.push(postItem);
    }

    return result;
  }

  async findAllWorking(corpsGetWorkingDto: CorpsGetWorkingDto) {
    let { name, city, gugun, score, hashtag, order, page } = corpsGetWorkingDto;
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
    if (score === undefined) {
      score = 0;
    }
    if (order === undefined) {
      order = 'cnt';
    }

    const queryBuilder = await this.corpRepository
      .createQueryBuilder('c')
      .select(['c.no AS no', 'c.corp_name AS corp_name', 'c.city AS city', 'c.gugun AS gugun', 'c.hashtag AS hashtag'])
      .leftJoin('c.reviews', 'rp')
      .addSelect(['COUNT(rp.no) AS cnt', 'ROUND(AVG(rp.total_score),1) as avg'])
      .where('c.corp_name LIKE :name', { name: `%${name}%` })
      .andWhere('c.city LIKE :city', { city: `%${city}%` })
      .andWhere('c.gugun LIKE :gugun', { gugun: `%${gugun}%` });

    if (hashtag && hashtag.length > 0) {
      queryBuilder.andWhere('JSON_CONTAINS(c.hashtag, :hashtag)', { hashtag: hashtag });
    }

    const corps = await queryBuilder
      .groupBy('c.corp_name')
      .having('avg >= :score', { score: score })
      .orderBy(order, 'DESC')
      .offset(skip)
      .limit(take)
      .getRawMany();

    const result: CorpsGetWorkingResponseDto[] = [];

    for (const corp of corps) {
      const postItem = new CorpsGetWorkingResponseDto(corp.no, corp.corp_name, corp.city, corp.gugun, corp.hashtag, corp.cnt, corp.avg);
      result.push(postItem);
    }

    return result;
  }

  async findOneWorking(name: string) {
    const corp = await this.corpRepository
      .createQueryBuilder('c')
      .select(['c.no AS no', 'c.corp_name AS corp_name', 'c.city AS city', 'c.gugun AS gugun', 'c.hashtag AS hashtag'])
      .leftJoin('c.reviews', 'rp')
      .addSelect(['COUNT(rp.no) AS cnt', 'ROUND(AVG(rp.total_score),1) as avg'])
      .where('c.corp_name = :name', { name: name })
      .groupBy('c.corp_name')
      .getRawOne();

    return corp;
  }

  async findOne(name: string) {
    const corp = await this.corpRepository.findOneBy({ corp_name: name });

    if (!corp) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

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
}
