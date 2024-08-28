import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Perspective from 'perspective-api-client';
import { Notice } from 'src/entity/notice.entity';
import { Repository } from 'typeorm';
import { NoticeCreateDto } from './dto/notice-create.dto';
import { User } from 'src/entity/user.entity';
import { NoticeUpdateDto } from './dto/notice-update.dto';
import { NoticeGetResponseDto, PublicNoticeGetResponseDto } from './dto/notice-get.dto';
import { NoticeLikeDto } from './dto/notice-like.dto';
import { NoticeLike } from 'src/entity/notice-like.entity';
import { NoticeComment } from 'src/entity/notice-comment.entity';
import { NoticeCommentLike } from 'src/entity/notice-comment-like.entity';
import { NoticeCommentCreateDto } from './dto/comment-create.dto';
import { NoticeCommentGetResponseDto } from './dto/comment-get.dto';
import { NoticeCommentLikeDto } from './dto/comment-like.dto';

@Injectable()
export class NoticeService {
  constructor(
    @InjectRepository(Notice)
    private readonly noticeRepository: Repository<Notice>,
    @InjectRepository(NoticeLike)
    private readonly noticeLikeRepository: Repository<NoticeLike>,
    @InjectRepository(NoticeComment)
    private readonly noticeCommentRepository: Repository<NoticeComment>,
    @InjectRepository(NoticeCommentLike)
    private readonly noticeCommentLikeRepository: Repository<NoticeCommentLike>,
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

  async getNotice(noticeId: number) {
    const notice = await this.noticeRepository.findOne({ where: { id: noticeId }, relations: ['user', 'likes', 'comments'] });

    if (!notice.id) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    if (notice.is_del) {
      return { msg: 'is_del' };
    }
    const result = new NoticeGetResponseDto(notice);
    return result;
  }

  async getPublicNotice() {
    const notice = await this.noticeRepository.find({
      where: { is_show: true },
      relations: ['user', 'likes', 'comments'],
      order: { sort_order: 'ASC', created_at: 'DESC' },
    });

    const result = notice.map(item => new PublicNoticeGetResponseDto(item));
    return result;
  }

  async updateView(noticeId: number) {
    const notice = await this.noticeRepository.findOne({ where: { id: noticeId } });
    if (!notice.id) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    notice.view += 1;
    await this.noticeRepository.save(notice);
    return;
  }

  async updateNoticeLike(userId: number, noticeLikeDto: NoticeLikeDto) {
    if (userId !== noticeLikeDto.user_id || !userId) {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }
    const notice = await this.noticeRepository.findOne({ where: { id: noticeLikeDto.notice_id } });
    if (!notice.id) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const like = await this.noticeLikeRepository.findOne({ where: { notice_id: noticeLikeDto.notice_id, user_id: noticeLikeDto.user_id } });
    if (noticeLikeDto.type === 'like') {
      if (!like) {
        const newLike = await this.noticeLikeRepository.create({
          notice_id: noticeLikeDto.notice_id,
          user_id: noticeLikeDto.user_id,
          type: 1,
        });
        await this.noticeLikeRepository.save(newLike);
        return { success: true, msg: '좋아요' };
      }
      if (like.type === 1) {
        await this.noticeLikeRepository.remove(like);
        return { success: true, msg: '좋아요 취소' };
      }
      return { success: false, msg: '타입 오류' };
    }
    if (noticeLikeDto.type === 'dislike') {
      if (!like) {
        const newLike = await this.noticeLikeRepository.create({
          notice_id: noticeLikeDto.notice_id,
          user_id: noticeLikeDto.user_id,
          type: -1,
        });
        await this.noticeLikeRepository.save(newLike);
        return { success: true, msg: '싫어요' };
      }
      if (like.type === -1) {
        await this.noticeLikeRepository.remove(like);
        return { success: true, msg: '싫어요 취소' };
      }
      return { success: false, msg: '타입 오류' };
    }
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

  async deleteNotice(userId: number, noticeId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user.authority !== 100) {
      throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
    }

    const notice = await this.noticeRepository.findOneBy({ id: noticeId });
    if (!notice.id) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    notice.updated_at = new Date();
    notice.is_del = true;

    const savedNotice = await this.noticeRepository.save(notice);
    if (!savedNotice.id) {
      throw new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return { notice: savedNotice };
  }

  //댓글
  async createComment(userId: number, commentCreateDto: NoticeCommentCreateDto) {
    const { content, user_id, post_id, parent_id } = commentCreateDto;

    if (userId !== user_id) {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }
    const notice = await this.noticeRepository.findOne({ where: { id: post_id } });
    if (!notice.id) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const validContent = await this.perspective(content);
    if (!validContent) {
      throw new HttpException({ msg: 'Invalid content' }, HttpStatus.BAD_REQUEST);
    }

    const comment = await this.noticeCommentRepository.create(commentCreateDto);
    const savedComment = await this.noticeCommentRepository.save(comment);
    if (!savedComment.id) {
      throw new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return { success: true, comment: savedComment };
  }

  async getComments(noticeId: number) {
    const comments = await this.noticeCommentRepository.find({
      where: { post_id: noticeId, is_del: false },
      relations: ['user', 'likes'],
    });
    const result = comments.map(comment => new NoticeCommentGetResponseDto(comment));
    return result;
  }

  async updateCommentLike(userId: number, commentLikeDto: NoticeCommentLikeDto) {
    if (userId !== commentLikeDto.user_id || !userId) {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }
    const comment = await this.noticeCommentRepository.findOne({ where: { id: commentLikeDto.comment_id } });
    if (!comment.id) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const like = await this.noticeCommentLikeRepository.findOne({ where: { comment_id: commentLikeDto.comment_id, user_id: commentLikeDto.user_id } });
    if (commentLikeDto.type === 'like') {
      if (!like) {
        const newLike = await this.noticeCommentLikeRepository.create({
          comment_id: commentLikeDto.comment_id,
          user_id: commentLikeDto.user_id,
          type: 1,
        });
        await this.noticeCommentLikeRepository.save(newLike);
        return { success: true, msg: '좋아요' };
      }
      if (like.type === 1) {
        await this.noticeCommentLikeRepository.remove(like);
        return { success: true, msg: '좋아요 취소' };
      }
      return { success: false, msg: '타입 오류' };
    }
    if (commentLikeDto.type === 'dislike') {
      if (!like) {
        const newLike = await this.noticeCommentLikeRepository.create({
          comment_id: commentLikeDto.comment_id,
          user_id: commentLikeDto.user_id,
          type: -1,
        });
        await this.noticeCommentLikeRepository.save(newLike);
        return { success: true, msg: '싫어요' };
      }
      if (like.type === -1) {
        await this.noticeCommentLikeRepository.remove(like);
        return { success: true, msg: '싫어요 취소' };
      }
      return { success: false, msg: '타입 오류' };
    }
  }

  async updateComment(userId: number, commentId: number, content: string) {
    const comment = await this.noticeCommentRepository.findOne({ where: { id: commentId } });
    if (!comment.id) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    if (userId !== comment.user_id) {
      throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
    }
    const validContent = await this.perspective(content);
    if (!validContent) {
      throw new HttpException({ msg: 'Invalid content' }, HttpStatus.BAD_REQUEST);
    }

    comment.content = content;
    const savedComment = await this.noticeCommentRepository.save(comment);
    if (!savedComment.id) {
      throw new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return savedComment;
  }

  async deleteComment(userId: number, commentId: number) {
    const comment = await this.noticeCommentRepository.findOneBy({ id: commentId });
    if (!comment.id) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    if (userId !== comment.user_id) {
      throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
    }
    const childComment = await this.noticeCommentRepository.find({ where: { parent_id: commentId } });
    if (childComment.length > 0) {
      return { success: true, msg: '대댓글 존재' };
    }

    comment.updated_at = new Date();
    comment.is_del = true;

    const savedComment = await this.noticeCommentRepository.save(comment);
    if (!savedComment.id) {
      throw new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return { success: true, msg: '삭제완료' };
  }

  async perspective(text: string) {
    try {
      const perspective = new Perspective({ apiKey: process.env.GOOGLE_PERSPECTIVE_API_KEY });
      const response = await perspective.analyze(text);
      const score = response.attributeScores.TOXICITY.summaryScore.value;
      if (score > 0.35) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      console.error(error);
      return true;
    }
  }
}
