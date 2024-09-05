import { Body, Controller, Get, Param, Patch, Post, UploadedFile, UseInterceptors, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommunityService } from './community.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetCurrentUser, Public } from 'src/common/decorators';
import { PostCreateDto } from './dto/post-create.dto';
import { PostUpdateDto } from './dto/post-update.dto';
import { PostLikeDto } from './dto/post-like.dto';
import { CommunityCommentCreateDto } from './dto/comment-create.dto';
import { CommentLikeDto } from './dto/comment-like.dto';
import { CommunityCommentAcceptDto } from './dto/comment-accept.dto';
import { PostsGetDto } from './dto/post-get.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { RoleType } from 'src/common/role-type';
import { Roles } from 'src/common/decorators/role.decorator';

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
  @Get('/post/list')
  @ApiOperation({ summary: '게시글 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '게시글 목록 조회 성공',
  })
  async getPostList(@Query() postsGetDto: PostsGetDto) {
    const response = await this.communityService.getPostList(postsGetDto);

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

  @Post('/comment')
  @ApiOperation({ summary: '댓글 작성' })
  @ApiResponse({
    status: 201,
    description: '댓글 작성 완료',
  })
  async createComment(@GetCurrentUser('id') userId: number, @Body() commentCreateDto: CommunityCommentCreateDto) {
    const response = await this.communityService.createComment(userId, commentCreateDto);
    return response;
  }

  @Public()
  @Get('/post/:id/comments')
  @ApiOperation({ summary: '게시글 댓글 조회' })
  @ApiResponse({ status: 200, description: '게시글 댓글 조회 완료' })
  async getComments(@Param('id') postId: number) {
    const response = await this.communityService.getComments(postId);
    return response;
  }

  @Patch('/comment/like/:id')
  @ApiOperation({ summary: '댓글 좋아요 수정' })
  @ApiResponse({
    status: 200,
    description: '댓글 좋아요 수정',
  })
  async updateCommentLike(@GetCurrentUser('id') userId: number, @Body() commentLikeDto: CommentLikeDto) {
    const response = await this.communityService.updateCommentLike(userId, commentLikeDto);
    return response;
  }

  @Patch('/comment/edit/:id')
  @ApiOperation({ summary: '댓글 수정' })
  @ApiResponse({
    status: 200,
    description: '댓글 수정',
  })
  async updateComment(@GetCurrentUser('id') userId: number, @Param('id') commentId: number, @Body() updateDto: any) {
    const response = await this.communityService.updateComment(userId, commentId, updateDto.content);
    return response;
  }

  @Delete('/comment/:id')
  @ApiOperation({ summary: '댓글 삭제' })
  @ApiResponse({
    status: 200,
    description: '댓글 삭제',
  })
  async deleteComment(@GetCurrentUser('id') userId: number, @Param('id') commentId: number) {
    const response = await this.communityService.deleteComment(userId, commentId);
    return response;
  }

  @Post('/comment/accept')
  @ApiOperation({ summary: '댓글 채택' })
  @ApiResponse({
    status: 201,
    description: '댓글 채택',
  })
  async acceptComment(@GetCurrentUser('id') userId: number, @Body() acceptDto: CommunityCommentAcceptDto) {
    const response = await this.communityService.acceptComment(userId, acceptDto);
    return response;
  }

  @Delete('/comment/accept/:id')
  @ApiOperation({ summary: '댓글 채택 취소' })
  @ApiResponse({
    status: 200,
    description: '댓글 채택 취소',
  })
  async unaccpetComment(@GetCurrentUser('id') userId: number, @Param('id') acceptedId: number) {
    const response = await this.communityService.unacceptComment(userId, acceptedId);
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
  @ApiOperation({ summary: 'Topic List 가져오기' })
  @ApiResponse({
    status: 200,
    description: 'Topic List 가져오기 성공',
  })
  async getTopic(@Param('type') type_id: number) {
    return await this.communityService.getTopic(type_id);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @Post('/weekly')
  @ApiOperation({ summary: '주간베스트 채택' })
  @ApiResponse({
    status: 201,
    description: '주간베스트 채택 완료',
  })
  async createWeekly(@GetCurrentUser('id') userId: number, @Body() body: { postId: number }) {
    const response = await this.communityService.createWeekly(userId, body.postId);
    return response;
  }

  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @Delete('/weekly')
  @ApiOperation({ summary: '주간베스트 채택 취소' })
  @ApiResponse({
    status: 201,
    description: '주간베스트 채택 취소 완료',
  })
  async deleteWeekly(@GetCurrentUser('id') userId: number, @Body() id: number) {
    const response = await this.communityService.deleteWeekly(userId, id);
    return response;
  }

  @Public()
  @Get('/weekly/list')
  @ApiOperation({ summary: '주간베스트 조회' })
  @ApiResponse({ status: 200, description: '주간베스트 조회 성공' })
  async getWeeklyList() {
    const response = await this.communityService.getWeeklyList();
    return response;
  }
}
