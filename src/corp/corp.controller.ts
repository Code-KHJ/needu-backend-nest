import { CorpService } from './corp.service';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CorpsGetDto } from './dto/corps-get.dto';
import { CorpCreateDto } from './dto/corp-create.dto';
import { CorpUpdateDto } from './dto/corp-update.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { RoleType } from 'src/common/role-type';
import { Roles } from 'src/common/decorators/role.decorator';

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

  @Get('/:name')
  @ApiOperation({ summary: '기관 조회' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
  })
  getCorp(@Param('name') name: string) {
    return this.corpService.findOne(name);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleType.VIEW)
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
}
