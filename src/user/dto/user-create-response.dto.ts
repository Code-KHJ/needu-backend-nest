import { PickType } from '@nestjs/swagger';
import { User } from '../../entity/user.entity';
import { UserCreateDto } from './user-create.dto';

export class UserCreateResponseDto extends PickType(User, ['id', 'nickname', 'phonenumber']) {
  constructor(requestDto: UserCreateDto) {
    super();
    const { id, nickname, phonenumber } = requestDto;
    this.id = id;
    this.nickname = nickname;
    this.phonenumber = phonenumber;
  }
}
