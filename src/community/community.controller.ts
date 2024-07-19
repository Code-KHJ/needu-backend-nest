import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommunityService } from './community.service';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Community')
@Controller('/api/community')
export class CommunityController {
  constructor(private communityService: CommunityService) {}

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
}
