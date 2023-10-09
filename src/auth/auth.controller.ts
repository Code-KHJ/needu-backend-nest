import { Body, Controller, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { RtGuard } from 'src/common/guards';
import { GetCurrentUser, Public } from 'src/common/decorators';

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
    const { accessToken, refreshToken } = await this.authService.login(loginDto);
    this.setCookies(accessToken, refreshToken, res);

    return res.status(HttpStatus.OK).json({ message: '로그인 성공' });
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

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @ApiOperation({ summary: 'Token Refresh' })
  @ApiResponse({
    status: 201,
    description: '토큰 리프레시',
  })
  async refreshToekns(@GetCurrentUser() user, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.refresh(user.id, user.refreshToken);

    this.setCookies(accessToken, refreshToken, res);

    return res.status(HttpStatus.OK).json({ message: '토큰 리프레시 성공' });
  }

  private setCookies(accessToken: string, refreshToken: string, res: Response) {
    res.cookie('accessToken', accessToken, { secure: false, httpOnly: true });
    res.cookie('refreshToken', refreshToken, { secure: false, httpOnly: true });
  }
}
