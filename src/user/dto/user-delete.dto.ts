import { PickType } from '@nestjs/swagger';
import { User } from '../../entity/user.entity';

export class UserDeleteeDto extends PickType(User, ['user_id', 'password']) {}
