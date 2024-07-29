import { Body, Controller, Get, Param, Patch, Post, UploadedFile, UseInterceptors, Delete } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommunityService } from './community.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetCurrentUser, Public } from 'src/common/decorators';
import { PostCreateDto } from './dto/post-create.dto';
import { PostUpdateDto } from './dto/post-update.dto';
import { PostLikeDto } from './dto/post-like.dto';

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

  @Public()
  @Get('/post/:id')
  @ApiOperation({ summary: '게시글 조회' })
  @ApiResponse({
    status: 200,
    description: '게시물 조회 완료',
  })
  async getPost(@Param('id') postId: number) {
    const response = await this.communityService.getPost(postId);
    return response;
  }

  @Get('/post/edit/:id')
  @ApiOperation({ summary: '게시글 수정 위해 조회' })
  @ApiResponse({
    status: 200,
    description: '게시글 조회',
  })
  async getPostForEdit(@GetCurrentUser('id') userId: number, @Param('id') postId: number) {
    const response = await this.communityService.getPostForEdit(userId, postId);
    return response;
  }

  @Public()
  @Patch('/post/view/:id')
  @ApiOperation({ summary: '게시글 view 수정' })
  @ApiResponse({
    status: 200,
    description: '게시글 view 수정',
  })
  async updateView(@Param('id') postId: number) {
    const response = await this.communityService.updateView(postId);
    return response;
  }

  @Patch('/post/like/:id')
  @ApiOperation({ summary: '게시글 좋아요 수정' })
  @ApiResponse({
    status: 200,
    description: '게시글 좋아요 수정',
  })
  async updatePostLike(@GetCurrentUser('id') userId: number, @Param('id') postId: number, @Body() postLikeDto: PostLikeDto) {
    const response = await this.communityService.updatePostLike(userId, postLikeDto);
    return response;
  }

  @Patch('/post/edit/:id')
  @ApiOperation({ summary: '게시글 수정' })
  @ApiResponse({
    status: 201,
    description: '게시글 수정',
  })
  async updatePost(@GetCurrentUser('id') userId: number, @Param('id') postId: number, @Body() postUpdateDto: PostUpdateDto) {
    const response = await this.communityService.updatePost(userId, postUpdateDto);
    return response;
  }

  @Delete('/post/:id')
  @ApiOperation({ summary: '게시글 삭제' })
  @ApiResponse({
    status: 200,
    description: '게시글 삭제',
  })
  async deletePost(@GetCurrentUser('id') userId: number, @Param('id') postId: number) {
    const response = await this.communityService.deletePost(userId, postId);
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
  @Get('/topic/:type')
  async getTopic(@Param('type') type_id: number) {
    return await this.communityService.getTopic(type_id);
  }
}
