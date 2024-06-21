import { Body, Controller, Delete, Get, HttpStatus, Post, Param, Req, Res, Put, Patch } from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserDuplicDto } from './dto/user-duplic.dto';
import { UserCreateDto } from './dto/user-create.dto';
import { UserDeleteeDto } from './dto/user-delete.dto';
import { GetCurrentUser, Public } from '../common/decorators';
import { CareerCreateDto } from './dto/career-create.dto';

@ApiTags('User')
@Controller('/api/user')
export class UserController {
  constructor(private userService: UserService) {}

  @Public()
  @Post('/signup')
  @ApiOperation({ summary: '회원가입 요청' })
  @ApiResponse({
    status: 201,
    description: '회원가입 완료',
  })
  create(@Body() userCreateDto: UserCreateDto) {
    return this.userService.create(userCreateDto);
  }

  @Public()
  @Post('/duplic')
  @ApiOperation({ summary: '회원정보 중복 여부' })
  @ApiResponse({
    status: 200,
    description: '사용 가능',
  })
  async duplic(@Body() userDupicDto: UserDuplicDto, @Res() res: Response) {
    const result = await this.userService.duplic(userDupicDto);
    console.log(result);
    return res.json(result);
  }

  @Public()
  @Post('/verifyemail')
  @ApiOperation({ summary: '회원가입 이메일 인증' })
  @ApiResponse({
    status: 200,
    description: '인증 완료',
  })
  async verifyEmail(@Body() email: object, @Res() res: Response) {
    const result = await this.userService.verifyEmail(email);
    return res.json(result);
  }

  @Public()
  @Post('/verifyphone')
  @ApiOperation({ summary: '휴대전화 인증' })
  @ApiResponse({
    status: 200,
    description: '인증 완료',
  })
  async verifyEPhone(@Body() phone: object, @Res() res: Response) {
    const result = await this.userService.verifyPhone(phone);
    return res.json(result);
  }

  @Put('/update')
  @ApiOperation({ summary: '회원정보 수정' })
  @ApiResponse({
    status: 200,
    description: '회원정보 수정 성공',
  })
  update() {}

  /////토큰 기능 구현 완료 후에 토큰 기준으로 처리
  @Public()
  @Put('/update/pw')
  @ApiOperation({ summary: '비밀번호 수정' })
  @ApiResponse({
    status: 200,
    description: '비밀번호 수정 성공',
  })
  async updatePw(@Body() data: object, @Res() res: Response) {
    const result = await this.userService.updatePw(data);
    if (result) {
      return res.status(HttpStatus.OK).json({ message: '비밀번호 수정 성공' });
    }
  }

  @Delete('/')
  @ApiOperation({ summary: '회원탈퇴' })
  @ApiResponse({
    status: 200,
    description: '회원탈퇴 성공',
  })
  async remove(@GetCurrentUser('id') userId: string, @Body() userDeleteDto: UserDeleteeDto, @Res() res: Response) {
    console.log(userId);
    userDeleteDto.id = userId;
    const result = await this.userService.remove(userDeleteDto);
    if (result) {
      return res.status(HttpStatus.OK).json({ message: '회원탈퇴 성공' });
    }
  }

  @Public()
  @Post('/find/user')
  @ApiOperation({ summary: '유저 정보 찾기' })
  @ApiResponse({
    status: 201,
    description: '유저 정보 찾기 성공',
  })
  async findId(@Body() data: object, @Res() res: Response) {
    const result = await this.userService.findUser(data);
    return res.json(result);
  }

  @Post('/career/:userId')
  @ApiOperation({ summary: '커리어 생성' })
  @ApiResponse({
    status: 201,
    description: '커리어 작성',
  })
  async createCareer(@Body() careerCreateDto: CareerCreateDto) {
    const response = await this.userService.createCareer(careerCreateDto);
    return;
  }

  @Patch('/career/:no')
  @ApiOperation({ summary: '커리어 수정' })
  @ApiResponse({
    status: 201,
    description: '커리어 수정',
  })
  async updateCareer() {}
}
