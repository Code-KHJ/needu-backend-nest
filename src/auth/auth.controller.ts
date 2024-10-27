import { Body, Controller, Get, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { GetCurrentUser, Public } from '../common/decorators';
import { RtGuard } from '../common/guards';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

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
    const { id, user_id, nickname, authority, profile_image, accessToken, refreshToken } = await this.authService.login(loginDto);
    this.setCookies(accessToken, refreshToken, res);

    return res
      .status(HttpStatus.OK)
      .json({ message: '로그인 성공', id: id, user_id: user_id, nickname: nickname, authority: authority, profile_image: profile_image });
  }

  @Post('logout')
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({
    status: 200,
    description: '로그아웃 성공',
  })
  async logout(@GetCurrentUser('user_id') userId: string, @Res() res: Response) {
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
    @GetCurrentUser('id') id: number,
    @GetCurrentUser('user_id') userId: string,
    @GetCurrentUser('nickname') userNickname: string,
    @GetCurrentUser('authority') authority: string,
    @GetCurrentUser('profile_image') profile_image: string,
    @Res() res: Response,
  ) {
    return res
      .status(HttpStatus.OK)
      .json({ message: '회원정보', id: id, user_id: userId, nickname: userNickname, authority: authority, profile_image: profile_image });
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @ApiOperation({ summary: 'Token Refresh' })
  @ApiResponse({
    status: 200,
    description: '토큰 리프레시',
  })
  async refreshTokens(@GetCurrentUser() user, @Res() res: Response) {
    const { accessToken, refreshToken, msg } = await this.authService.refresh(user.id, user.refreshToken);

    if (msg === 'delete token') {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return res.status(HttpStatus.OK).json({ message: '토큰 만료' });
    }

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

    const redirectUrl = process.env.SSO_REDIRECT_URL;
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

    const redirectUrl = process.env.SSO_REDIRECT_URL;
    return res.redirect(HttpStatus.FOUND, redirectUrl);
  }
}
