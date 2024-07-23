import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { NoticeService } from './notice.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { RoleType } from 'src/common/role-type';
import { Roles } from 'src/common/decorators/role.decorator';
import { GetCurrentUser } from 'src/common/decorators';
import { NoticeCreateDto } from './dto/notice-create.dto';

@Controller('notice')
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
  async getNoticeForEdit(@GetCurrentUser('id') userId: number) {}
}
