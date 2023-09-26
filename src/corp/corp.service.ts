import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Corp } from '../entity/corp.entity';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { CorpsGetDto } from './dto/corps-get.dto';
import { CorpsGetResponseDto } from './dto/corps-get-response.dto';
import { CorpCreateDto } from './dto/corp-create.dto';

@Injectable()
export class CorpService {
  constructor(
    @InjectRepository(Corp)
    private readonly corpRepository: Repository<Corp>,
  ) {}

  async findAll(corpsGetDto: CorpsGetDto) {
    let { name, city, gugun, page } = corpsGetDto;
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

    const options: FindManyOptions<Corp> = {
      where: {
        corp_name: Like(`%${name}%`),
        city: Like(`%${city}%`),
        gugun: Like(`%${gugun}%`),
      },
      take,
      skip,
      order: { no: 'ASC' },
    };
    const corps = await this.corpRepository.find(options);
    const result: CorpsGetResponseDto[] = [];

    for (const corp of corps) {
      const postItem = new CorpsGetResponseDto(
        corp.no,
        corp.corp_name,
        corp.city,
        corp.gugun,
        corp.hashtag_top1,
        corp.hashtag_top2,
        corp.hashtag_top3,
        corp.hashtag_top4,
      );
      result.push(postItem);
    }

    return result;
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

  update(name: string) {
    return '미제공 기능';
  }

  delete(name: string) {
    return '미제공 기능';
  }
}
