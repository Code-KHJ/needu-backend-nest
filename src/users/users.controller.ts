import { UserLoginDto } from './dto/user-login.dto';
import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { UserService } from './users.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private userService: UserService) {}

  @Post('/login')
  @ApiOperation({ summary: '로그인' })
  // @ApiResponseDto()
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
  })
  login(@Body() userLoginDto: UserLoginDto) {
    return this.userService.login(userLoginDto);
  }
}
