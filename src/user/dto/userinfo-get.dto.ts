import { PickType } from '@nestjs/swagger';
import { User } from 'src/entity/user.entity';

export class UserInfoGetDto extends PickType(User, ['user_id', 'nickname', 'phonenumber', 'kakao', 'google', 'profile_image', 'activity_points']) {
  constructor(user: User) {
    super();
    this.user_id = user.user_id;
    this.nickname = user.nickname;
    this.phonenumber = user.phonenumber;
    this.kakao = user.kakao;
    this.google = user.google;
    this.profile_image = user.profile_image;
    this.activity_points = user.activity_points;
  }
}
