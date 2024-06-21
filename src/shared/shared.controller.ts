import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SharedService } from './shared.service';
import { Public } from 'src/common/decorators';

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
}
