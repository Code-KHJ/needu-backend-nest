import { PickType } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { CommunityPost } from 'src/entity/community-post.entity';

export class PostUpdateDto extends PickType(CommunityPost, ['title', 'topic_id', 'user_id']) {
  @IsNumber()
  id: number;
  @IsString()
  html: string;
  @IsString()
  markdown: string;
}
