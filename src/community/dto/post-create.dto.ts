import { OmitType, PickType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CommunityPost } from 'src/entity/community-post.entity';

export class PostCreateDto extends PickType(CommunityPost, ['title', 'topic_id', 'user_id']) {
  @IsString()
  html: string;
  @IsString()
  markdown: string;
}
