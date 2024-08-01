import { NoticeLike } from './../entity/notice-like.entity';
import { Module } from '@nestjs/common';
import { NoticeController } from './notice.controller';
import { NoticeService } from './notice.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notice } from 'src/entity/notice.entity';
import { User } from 'src/entity/user.entity';
import { NoticeComment } from 'src/entity/notice-comment.entity';
import { NoticeCommentLike } from 'src/entity/notice-comment-like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notice, NoticeLike, NoticeComment, NoticeCommentLike, User])],
  controllers: [NoticeController],
  providers: [NoticeService],
})
export class NoticeModule {}
