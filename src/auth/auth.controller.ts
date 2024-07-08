import { Body, Controller, HttpStatus, Post, Get, Req, Res, UseGuards, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { RtGuard } from '../common/guards';
import { GetCurrentUser, Public } from '../common/decorators';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Auth')
@Controller('/api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
  })
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const { id, nickname, authority, accessToken, refreshToken } = await this.authService.login(loginDto);
    this.setCookies(accessToken, refreshToken, res);

    return res.status(HttpStatus.OK).json({ message: '로그인 성공', id: id, nickname: nickname, authority: authority });
  }

  @Post('logout')
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({
    status: 200,
    description: '로그아웃 성공',
  })
  async logout(@GetCurrentUser('id') userId: string, @Res() res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    this.authService.logout(userId);
    return res.status(HttpStatus.OK).json({ message: '로그아웃 성공' });
  }

  @Get('me')
  @ApiOperation({ summary: '유저정보 요청' })
  @ApiResponse({
    status: 200,
    description: '회원정보 요청 성공',
  })
  async getUser(
    @GetCurrentUser('id') userId: string,
    @GetCurrentUser('nickname') userNickname: string,
    @GetCurrentUser('authority') authority: string,
    @Res() res: Response,
  ) {
    return res.status(HttpStatus.OK).json({ message: '회원정보', id: userId, nickname: userNickname, authority: authority });
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @ApiOperation({ summary: 'Token Refresh' })
  @ApiResponse({
    status: 200,
    description: '토큰 리프레시',
  })
  async refreshToekns(@GetCurrentUser() user, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.refresh(user.user_id, user.refreshToken);

    this.setCookies(accessToken, refreshToken, res);

    return res.status(HttpStatus.OK).json({ message: '토큰 리프레시 성공' });
  }

  private setCookies(accessToken: string, refreshToken: string, res: Response) {
    res.cookie('accessToken', accessToken, { secure: false, httpOnly: false });
    res.cookie('refreshToken', refreshToken, { secure: false, httpOnly: false });
  }

  @Public()
  @UseGuards(AuthGuard('kakao'))
  @Get('kakao')
  @ApiOperation({ summary: '카카오 로그인 페이지' })
  async kakaoLogin() {
    return;
  }

  @Public()
  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  @ApiOperation({ summary: '카카오 리다이렉트 페이지' })
  @ApiResponse({
    status: 302,
    description: '카카오 리다이렉트 페이지',
  })
  async kakaoLoginCallback(@Req() req: Request & { user?: any }, @Res() res: Response) {
    const { id, nickname, accessToken, refreshToken } = await this.authService.kakaoLogin(req.user);
    this.setCookies(accessToken, refreshToken, res);

    const redirectUrl = 'http://localhost:5173';
    return res.redirect(HttpStatus.FOUND, redirectUrl);
  }

  @Public()
  @UseGuards(AuthGuard('google'))
  @Get('google')
  @ApiOperation({ summary: '구글 로그인 페이지' })
  async googleLogin() {
    return;
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: '구글 리다이렉트 페이지' })
  @ApiResponse({
    status: 302,
    description: '구글 리다이렉트 페이지',
  })
  async googleLoginCallback(@Req() req: Request & { user?: any }, @Res() res: Response) {
    const { id, nickname, accessToken, refreshToken } = await this.authService.googleLogin(req.user);
    this.setCookies(accessToken, refreshToken, res);

    const redirectUrl = 'http://localhost:5173';
    return res.redirect(HttpStatus.FOUND, redirectUrl);
  }
}
