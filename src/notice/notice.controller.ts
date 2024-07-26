import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { NoticeService } from './notice.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { RoleType } from 'src/common/role-type';
import { Roles } from 'src/common/decorators/role.decorator';
import { GetCurrentUser } from 'src/common/decorators';
import { NoticeCreateDto } from './dto/notice-create.dto';
import { NoticeUpdateDto } from './dto/notice-update.dto';

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
}
