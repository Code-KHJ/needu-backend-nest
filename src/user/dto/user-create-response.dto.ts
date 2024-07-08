import { PickType } from '@nestjs/swagger';
import { User } from '../../entity/user.entity';
import { UserCreateDto } from './user-create.dto';

export class UserCreateResponseDto extends PickType(User, ['user_id', 'nickname', 'phonenumber']) {
  constructor(requestDto: UserCreateDto) {
    super();
    const { user_id, nickname, phonenumber } = requestDto;
    this.user_id = user_id;
    this.nickname = nickname;
    this.phonenumber = phonenumber;
  }
}
