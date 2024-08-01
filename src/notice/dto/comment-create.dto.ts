import { PickType } from '@nestjs/swagger';
import { NoticeComment } from 'src/entity/notice-comment.entity';

export class NoticeCommentCreateDto extends PickType(NoticeComment, ['content', 'parent_id', 'notice_id', 'user_id']) {}
