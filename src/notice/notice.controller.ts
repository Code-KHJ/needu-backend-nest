import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { NoticeService } from './notice.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { RoleType } from 'src/common/role-type';
import { Roles } from 'src/common/decorators/role.decorator';
import { GetCurrentUser, Public } from 'src/common/decorators';
import { NoticeCreateDto } from './dto/notice-create.dto';
import { NoticeUpdateDto } from './dto/notice-update.dto';
import { NoticeLikeDto } from './dto/notice-like.dto';
import { NoticeCommentCreateDto } from './dto/comment-create.dto';
import { NoticeCommentLikeDto } from './dto/comment-like.dto';

@ApiTags('Notice')
@Controller('/api/notice')
export class NoticeController {
  constructor(private noticeService: NoticeService) {}

  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @Post('/')
  @ApiOperation({ summary: '공지사항 작성' })
  @ApiResponse({
    status: 201,
    description: '공지사항 작성 완료',
  })
  async createNotice(@GetCurrentUser('id') userId: number, @Body() noticeCreateDto: NoticeCreateDto) {
    const response = await this.noticeService.createNotice(userId, noticeCreateDto);

    return response;
  }

  @Public()
  @Get('/:id')
  @ApiOperation({ summary: '공지사항 조회' })
  @ApiResponse({
    status: 200,
    description: '공지사항 조회 완료',
  })
  async getNotice(@Param('id') noticeId: number) {
    const response = await this.noticeService.getNotice(noticeId);
    return response;
  }

  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @Get('/edit/:id')
  @ApiOperation({ summary: '공지사항 수정용 조회' })
  @ApiResponse({
    status: 200,
    description: '조회 완료',
  })
  async getNoticeForEdit(@GetCurrentUser('id') userId: number, @Param('id') noticeId: number) {
    const response = await this.noticeService.getNoticeForEdit(userId, noticeId);

    return response;
  }

  @Public()
  @Patch('/view/:id')
  @ApiOperation({ summary: '공지사항 view 수정' })
  @ApiResponse({
    status: 200,
    description: '공지사항 view 수정',
  })
  async updateView(@Param('id') noticeId: number) {
    const response = await this.noticeService.updateView(noticeId);
    return response;
  }

  @Patch('/like/:id')
  @ApiOperation({ summary: '공지사항 좋아요 수정' })
  @ApiResponse({
    status: 200,
    description: '공지사항 좋아요 수정',
  })
  async updateNoticeLike(@GetCurrentUser('id') userId: number, @Param('id') noticeId: number, @Body() noticeLikeDto: NoticeLikeDto) {
    const response = await this.noticeService.updateNoticeLike(userId, noticeLikeDto);
    return response;
  }

  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @Patch('/edit/:id')
  @ApiOperation({ summary: '공지사항 수정' })
  @ApiResponse({
    status: 201,
    description: '공지사항 수정',
  })
  async updateNotice(@GetCurrentUser('id') userId: number, @Param('id') noticeId: number, @Body() noticeUpdateDto: NoticeUpdateDto) {
    const response = await this.noticeService.updateNotice(userId, noticeUpdateDto);

    return response;
  }

  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @Delete('/:id')
  @ApiOperation({ summary: '공지사항 삭제' })
  @ApiResponse({
    status: 200,
    description: '공지사항 삭제',
  })
  async deleteNotice(@GetCurrentUser('id') userId: number, @Param('id') noticeId: number) {
    const response = await this.noticeService.deleteNotice(userId, noticeId);
    return response;
  }

  @Post('/comment')
  @ApiOperation({ summary: '댓글 작성' })
  @ApiResponse({
    status: 201,
    description: '댓글 작성 완료',
  })
  async createComment(@GetCurrentUser('id') userId: number, @Body() commentCreateDto: NoticeCommentCreateDto) {
    const response = await this.noticeService.createComment(userId, commentCreateDto);
    return response;
  }

  @Public()
  @Get('/:id/comments')
  @ApiOperation({ summary: '게시글 댓글 조회' })
  @ApiResponse({ status: 200, description: '게시글 댓글 조회 완료' })
  async getComments(@Param('id') noticeId: number) {
    const response = await this.noticeService.getComments(noticeId);
    return response;
  }

  @Patch('/comment/like/:id')
  @ApiOperation({ summary: '댓글 좋아요 수정' })
  @ApiResponse({
    status: 200,
    description: '댓글 좋아요 수정',
  })
  async updateCommentLike(@GetCurrentUser('id') userId: number, @Body() commentLikeDto: NoticeCommentLikeDto) {
    const response = await this.noticeService.updateCommentLike(userId, commentLikeDto);
    return response;
  }

  @Delete('/comment/:id')
  @ApiOperation({ summary: '댓글 삭제' })
  @ApiResponse({
    status: 200,
    description: '댓글 삭제',
  })
  async deleteComment(@GetCurrentUser('id') userId: number, @Param('id') commentId: number) {
    const response = await this.noticeService.deleteComment(userId, commentId);
    return response;
  }
}
