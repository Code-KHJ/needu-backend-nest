import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notice } from 'src/entity/notice.entity';
import { Repository } from 'typeorm';
import { NoticeCreateDto } from './dto/notice-create.dto';
import { User } from 'src/entity/user.entity';
import { NoticeUpdateDto } from './dto/notice-update.dto';

@Injectable()
export class NoticeService {
  constructor(
    @InjectRepository(Notice)
    private readonly noticeRepository: Repository<Notice>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createNotice(userId: number, noticeCreateDto: NoticeCreateDto) {
    const { title, html, markdown, is_show, user_id } = noticeCreateDto;
    if (userId !== user_id) {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }
    const user = await this.userRepository.findOne({ where: { id: user_id } });
    if (user.authority !== 100) {
      throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
    }

    const noticeDto = {
      title: title,
      user_id: user_id,
      content: html,
      is_show: is_show,
    };

    const notice = this.noticeRepository.create(noticeDto);
    const savedNotice = await this.noticeRepository.save(notice);

    if (!savedNotice.id) {
      throw new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return { notice: savedNotice };
  }

  async getNoticeForEdit(userId: number, noticeId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user.authority !== 100) {
      throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
    }

    const notice = await this.noticeRepository.findOne({ where: { id: noticeId } });
    if (!notice.id) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    return notice;
  }

  async updateNotice(userId: number, noticeUpdateDto: NoticeUpdateDto) {
    const { id, title, html, markdown, user_id, is_show } = noticeUpdateDto;
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user.authority !== 100) {
      throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
    }
    const notice = await this.noticeRepository.findOne({ where: { id: id } });
    if (!notice.id) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    notice.title = title;
    notice.content = html;
    notice.user_id = user_id;
    notice.is_show = is_show;

    const savedNotice = await this.noticeRepository.save(notice);

    if (!savedNotice.id) {
      throw new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return { notice: savedNotice };
  }
}
