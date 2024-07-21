import { Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommunityService } from './community.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetCurrentUser, Public } from 'src/common/decorators';
import { PostCreateDto } from './dto/post-create.dto';

@ApiTags('Community')
@Controller('/api/community')
export class CommunityController {
  constructor(private communityService: CommunityService) {}

  @Post('/post')
  @ApiOperation({ summary: '게시글 작성' })
  @ApiResponse({
    status: 201,
    description: '게시글 작성 완료',
  })
  async createPost(@GetCurrentUser('id') userId: number, @Body() postCreateDto: PostCreateDto) {
    const response = await this.communityService.createPost(userId, postCreateDto);

    return response;
  }

  @UseInterceptors(FileInterceptor('image'))
  @Post('/image')
  @ApiOperation({ summary: '이미지 업로드' })
  @ApiResponse({
    status: 201,
    description: '이미지 업로드 성공',
  })
  async uploadImage(@UploadedFile() file: Express.MulterS3.File) {
    return { imageUrl: file.location };
  }

  @Public()
  @Get('/')
  async test() {
    this.communityService.test();
  }

  @Public()
  @Get('/topic/:type')
  async getTopic(@Param('type') type_id: number) {
    return await this.communityService.getTopic(type_id);
  }
}
