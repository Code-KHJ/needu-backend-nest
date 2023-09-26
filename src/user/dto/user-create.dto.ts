import { OmitType } from '@nestjs/swagger';
import { User } from '../../entity/user.entity';

export class UserCreateDto extends OmitType(User, ['no', 'authority', 'created_date', 'modified_date', 'login_date']) {}
