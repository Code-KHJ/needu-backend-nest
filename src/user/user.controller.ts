import { UserLoginDto } from './dto/user-login.dto';
import { Body, Controller, Delete, Get, HttpStatus, Post, Param, Req, Res, Put } from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserDuplicDto } from './dto/user-duplic.dto';
import { UserCreateDto } from './dto/user-create.dto';
import { UserDeleteeDto } from './dto/user-delete.dto';

@ApiTags('User')
@Controller('/api/user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/signup')
  viewSignup(@Res() res: Response) {
    res.status(HttpStatus.OK).render('views/signup.html');
  }

  @Post('/signup')
  @ApiOperation({ summary: '회원가입 요청' })
  @ApiResponse({
    status: 201,
    description: '회원가입 완료',
  })
  create(@Body() userCreateDto: UserCreateDto) {
    return this.userService.create(userCreateDto);
  }

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

  @Post('/signup/mail')
  @ApiOperation({ summary: '회원가입 이메일 인증' })
  @ApiResponse({
    status: 200,
    description: '인증 완료',
  })
  async verifyEmail(@Body() email: object, @Res() res: Response) {
    const result = await this.userService.verifyEmail(email);
    return res.json(result);
  }

  /////토큰 기능 구현 완료 후에 토큰 기준으로 처리
  @Put('/update')
  @ApiOperation({ summary: '회원정보 수정' })
  @ApiResponse({
    status: 200,
    description: '회원정보 수정 성공',
  })
  update() {}

  /////토큰 기능 구현 완료 후에 토큰 기준으로 처리
  @Post('/updatePw') //put
  updatePw() {}

  @Delete(':id')
  @ApiOperation({ summary: '회원탈퇴' })
  @ApiResponse({
    status: 200,
    description: '회원탈퇴 성공',
  })
  async remove(@Param('id') id: string, @Body() userDeleteDto: UserDeleteeDto, @Res() res: Response) {
    userDeleteDto.id = id;
    const result = await this.userService.remove(userDeleteDto);
    if (result) {
      return res.status(HttpStatus.OK).json({ message: '회원탈퇴 성공' });
    }
  }

  @Get('/login')
  viewLogin(@Res() res: Response) {
    res.status(HttpStatus.OK).render('views/login.html');
  }

  @Post('/login')
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
  })
  async login(@Body() userLoginDto: UserLoginDto, @Res() res: Response) {
    try {
      const { accessToken, refreshToken } = await this.userService.login(userLoginDto);
      res.cookie('accessToken', accessToken, { secure: false, httpOnly: true });
      res.cookie('refreshToken', refreshToken, { secure: false, httpOnly: true });
      return res.status(HttpStatus.OK).json({ message: '로그인 성공' });
    } catch (error) {
      return res.status(error.getStatus()).json({ message: error.message });
    }
  }

  @Get('/logout')
  logout() {}

  @Post('/findId')
  findId() {}

  @Post('/findPw')
  findPw() {}
}
