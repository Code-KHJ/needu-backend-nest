import { PickType } from '@nestjs/swagger';
import { CommunityComment } from 'src/entity/community-comment.entity';

export class CommunityCommentCreateDto extends PickType(CommunityComment, ['content', 'parent_id', 'post_id', 'user_id']) {}
