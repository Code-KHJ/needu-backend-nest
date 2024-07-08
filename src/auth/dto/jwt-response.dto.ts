import { PickType } from '@nestjs/swagger';
import { User } from '../../entity/user.entity';

export class JwtResponseDto extends PickType(User, ['user_id', 'nickname', 'phonenumber', 'authority', 'login_date']) {
  constructor(user: User) {
    super();
    this.user_id = user.user_id;
    this.nickname = user.nickname;
    this.phonenumber = user.phonenumber;
    this.authority = user.authority;
    this.login_date = user.login_date;
  }
}
