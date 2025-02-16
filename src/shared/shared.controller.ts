import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetCurrentUser, Public } from 'src/common/decorators';
import { ReportCreateDto } from './dto/report-create.dto';
import { SubscribeCreateDto } from './dto/subscribe-create.dto';
import { SharedService } from './shared.service';

@ApiTags('Shared')
@Controller('/api/shared')
export class SharedController {
  constructor(private sharedService: SharedService) {}

  @Public()
  @Get('/careertype')
  @ApiOperation({ summary: '직종 조회' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
  })
  getCareerType() {
    return this.sharedService.getCareerType();
  }

  @Public()
  @Get('/hashtag')
  @ApiOperation({ summary: '해시태그 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
  })
  getHashtag() {
    return this.sharedService.getHashtag();
  }

  @Post('/report')
  @ApiOperation({ summary: '신고' })
  @ApiResponse({
    status: 201,
    description: '신고 접수 완료',
  })
  async createReport(@GetCurrentUser('id') user_id: number, @Body() reportCreateDto: ReportCreateDto) {
    return await this.sharedService.createReport(user_id, reportCreateDto);
  }

  @Public()
  @Post('/subscribe')
  @ApiOperation({ summary: '뉴스레터 구독' })
  @ApiResponse({
    status: 201,
    description: '뉴스레터 구독 완료',
  })
  async subscribe(@Body() subscribeCreateDto: SubscribeCreateDto) {
    return this.sharedService.subscribe(subscribeCreateDto);
  }
}
