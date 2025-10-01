import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators';
import { Roles } from '../common/decorators/role.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { RoleType } from '../common/role-type';
import { CorpService } from './corp.service';
import { CorpCreateDto } from './dto/corp-create.dto';
import { CorpUpdateDto } from './dto/corp-update.dto';
import { CorpsGetTrainingDto } from './dto/corps-get-training.dto';
import { CorpsGetWorkingDto } from './dto/corps-get-working.dto';
import { CorpsGetDto } from './dto/corps-get.dto';

@ApiTags('Corp')
@Controller('/api/corp')
export class CorpController {
  constructor(private corpService: CorpService) {}

  @Public()
  @Get('/find')
  @ApiOperation({ summary: '기관 전체 조회' })
  @ApiResponse({
    status: 200,
    description: '전체 조회 성공',
  })
  getAllCorps(@Query() corpsGetDto: CorpsGetDto) {
    return this.corpService.findAll(corpsGetDto);
  }

  @Public()
  @Get('/find/:name')
  @ApiOperation({ summary: '기관 조회' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
  })
  getCorp(@Param('name') name: string) {
    return this.corpService.findOne(name);
  }

  //완료
  @Public()
  @Get('/working')
  @ApiOperation({ summary: '기관 전체 조회 with 현직리뷰' })
  @ApiResponse({
    status: 200,
    description: '전체 조회 성공',
  })
  getAllWithWorking(@Query() corpsGetWorkingDto: CorpsGetWorkingDto) {
    return this.corpService.findAllWorking(corpsGetWorkingDto);
  }

  //완료
  @Public()
  @Get('/working/:name')
  @ApiOperation({ summary: '기관 조회 with 현직리뷰' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
  })
  getWithWorking(@Param('name') name: string) {
    return this.corpService.findOneWorking(name);
  }

  //완료
  @Public()
  @Get('/training')
  @ApiOperation({ summary: '기관 전체 조회 with 실습리뷰' })
  @ApiResponse({
    status: 200,
    description: '전체 조회 성공',
  })
  getAllWithTraining(@Query() corpsGetTrainingDto: CorpsGetTrainingDto) {
    return this.corpService.findAllTraining(corpsGetTrainingDto);
  }

  //완료
  @Public()
  @Get('/training/:name')
  @ApiOperation({ summary: '기관 조회 with 실습리뷰' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
  })
  getWithTraining(@Param('name') name: string) {
    return this.corpService.findOneTraining(name);
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

  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @Patch('/:name')
  @ApiOperation({ summary: '기관 정보 수정' })
  @ApiResponse({
    status: 200,
    description: '수정 성공',
  })
  update(@Param('name') name: string, @Body() corpUpdateDto: CorpUpdateDto) {
    corpUpdateDto.corp_name = name;
    return this.corpService.update(corpUpdateDto);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @Delete('/:name')
  @ApiOperation({ summary: '기관 삭제' })
  @ApiResponse({
    status: 200,
    description: '삭제 성공',
  })
  delete(@Param('name') name: string) {
    return this.corpService.delete(name);
  }

  @Public()
  @Get('/hotlist')
  @ApiOperation({ summary: '일별 hot 기관 조회' })
  @ApiResponse({
    status: 200,
    description: '일별 hot 기관 조회',
  })
  async getHotList() {
    const response = await this.corpService.getHotList();
    return response;
  }

  @Public()
  @Get('/dump')
  @ApiOperation({ summary: '로컬스토리지 저장용 기관 전체 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '전체 조회 성공',
  })
  async getAllCorpsForDump() {
    return await this.corpService.dump();
  }
}
