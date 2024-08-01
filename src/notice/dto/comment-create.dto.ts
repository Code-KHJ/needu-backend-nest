import { PickType } from '@nestjs/swagger';
import { NoticeComment } from 'src/entity/notice-comment.entity';

export class NoticeCommentCreateDto extends PickType(NoticeComment, ['content', 'parent_id', 'post_id', 'user_id']) {}
