import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { GetCurrentUser, Public } from '../common/decorators';
import { CareerCreateDto } from './dto/career-create.dto';
import { UserCreateDto } from './dto/user-create.dto';
import { UserDeleteeDto } from './dto/user-delete.dto';
import { UserDuplicDto } from './dto/user-duplic.dto';
import { UserService } from './user.service';

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

  @Patch('/update/info')
  @ApiOperation({ summary: '회원정보 수정' })
  @ApiResponse({
    status: 200,
    description: '회원정보 수정 성공',
  })
  async updateInfo(@GetCurrentUser('id') userId: number, @Body() userData: object) {
    const response = await this.userService.updateInfo(userId, userData);
    return response;
  }

  @Patch('/update/password')
  @ApiOperation({ summary: '비밀번호 수정' })
  @ApiResponse({
    status: 200,
    description: '비밀번호 수정 성공',
  })
  async updatePassword(@GetCurrentUser('id') userId: number, @Body() userDate: object) {
    const response = await this.userService.updatePassword(userId, userDate);
    return response;
  }

  @Public()
  @Post('/reset/request/')
  @ApiOperation({ summary: '비밀번호 재설정 이메일 요청' })
  @ApiResponse({
    status: 201,
    description: '이메일 발송 완료',
  })
  async reqResetPassword(@Body() userData: object) {
    const response = await this.userService.reqResetPassword(userData);
    return response;
  }

  @Public()
  @Get('/reset/valid/:token')
  @ApiOperation({ summary: '리셋 토큰 유효기간 검증' })
  @ApiResponse({
    status: 200,
    description: '리셋 토큰 유효',
  })
  async validResetToken(@Param('token') resetToken: string) {
    const response = await this.userService.validResetToken(resetToken);
    return response;
  }

  @Public()
  @Patch('/reset/password')
  @ApiOperation({ summary: '비밀번호 재설정' })
  @ApiResponse({
    status: 200,
    description: '비밀번호 재설정 성공',
  })
  async resetPassword(@Body() data: object) {
    const response = await this.userService.resetPassword(data);
    return response;
  }

  @Delete('/')
  @ApiOperation({ summary: '회원탈퇴' })
  @ApiResponse({
    status: 200,
    description: '회원탈퇴 성공',
  })
  async remove(@GetCurrentUser('user_id') userId: string, @Body() userDeleteDto: UserDeleteeDto, @Res() res: Response) {
    userDeleteDto.user_id = userId;
    const result = await this.userService.remove(userDeleteDto);
    if (result) {
      return res.status(HttpStatus.OK).json({ message: '회원탈퇴 성공' });
    }
  }

  @UseInterceptors(FileInterceptor('image'))
  @Post('/profile/image')
  @ApiOperation({ summary: '이미지 업로드' })
  @ApiResponse({
    status: 201,
    description: '이미지 업로드 성공',
  })
  async uploadImage(@GetCurrentUser('id') userId: number, @UploadedFile() file: Express.MulterS3.File) {
    const response = await this.userService.uploadProfile(userId, file);
    return response;
  }

  @Get('/profile')
  @ApiOperation({ summary: '유저 프로필 조회' })
  @ApiResponse({
    status: 200,
    description: '유저 프로필 조회 성공',
  })
  async getUserInfo(@GetCurrentUser('id') userId: number) {
    const response = await this.userService.getUserInfo(userId);
    return response;
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

  @Get('/career/list')
  @ApiOperation({ summary: '커리어 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '커리어 목록 조회',
  })
  async getCareerList(@GetCurrentUser('user_id') user_id: string) {
    const response = await this.userService.getCareerList(user_id);
    return response;
  }

  @Patch('/career')
  @ApiOperation({ summary: '커리어 수정' })
  @ApiResponse({
    status: 201,
    description: '커리어 수정',
  })
  async updateCareer(@GetCurrentUser('user_id') user_id: string, @Body() careerData: object) {
    const response = await this.userService.updateCareer(user_id, careerData);
    return response;
  }

  @Get('/point/log')
  @ApiOperation({ summary: '유저 포인트 내역 조회' })
  @ApiResponse({
    status: 200,
    description: '포인트 조회',
  })
  async getPointLog(@GetCurrentUser('id') userId: number) {
    const response = await this.userService.getPointLog(userId);
    return response;
  }
}
