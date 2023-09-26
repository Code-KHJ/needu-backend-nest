import { CorpService } from './corp.service';
import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CorpsGetDto } from './dto/corps-get.dto';
import { CorpCreateDto } from './dto/corp-create.dto';

@ApiTags('Corp')
@Controller('/api/corp')
export class CorpController {
  constructor(private corpService: CorpService) {}

  @Get('/')
  @ApiOperation({ summary: '기관 전체 조회' })
  @ApiResponse({
    status: 200,
    description: '전체 조회 성공',
  })
  getAllCorps(@Query() corpsGetDto: CorpsGetDto) {
    return this.corpService.findAll(corpsGetDto);
  }

  @Post('/')
  @ApiOperation({ summary: '기관 등록' })
  @ApiResponse({
    status: 201,
    description: '등록 성공',
  })
  create(@Body() corpCreateDto: CorpCreateDto) {
    return this.corpService.create(corpCreateDto);
  }

  @Post('/:name')
  @ApiOperation({ summary: '기관 정보 수정' })
  @ApiResponse({
    status: 200,
    description: '수정 성공',
  })
  update(@Param('name') name: string) {
    return this.corpService.update(name);
  }

  @Delete('/:name')
  @ApiOperation({ summary: '기관 삭제' })
  @ApiResponse({
    status: 200,
    description: '삭제 성공',
  })
  delete(@Param('name') name: string) {
    return this.corpService.delete(name);
  }
}
