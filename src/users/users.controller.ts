import { UserLoginDto } from './dto/user-login.dto';
import { Body, Controller, Get, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './users.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserDuplicDto } from './dto/user-duplic.dto';
import { UserSignupDto } from './dto/user-signup.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private userService: UserService) {}

  @Get('/signup')
  viewSignup(@Res() res: Response) {
    res.status(HttpStatus.OK).render('views/signup.html');
  }

  @Post('/signup')
  @ApiOperation({ summary: '회원가입 요청' })
  @ApiResponse({
    status: 200,
    description: '회원가입 완료',
  })
  async signup(@Body() userSignupDto: UserSignupDto, @Res() res: Response) {
    const result = await this.userService.signup(userSignupDto);
    console.log(result);
    if (result) {
      return res.status(HttpStatus.OK).json({ message: '회원가입 성공' });
    }
  }

  @Post('/signup/duplic')
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

  @Get('/login')
  viewLogin(@Res() res: Response) {
    res.status(HttpStatus.OK).render('views/login.html');
  }

  @Post('/login')
  @ApiOperation({ summary: '로그인' })
  // @ApiResponseDto()
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
}
