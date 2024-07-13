import { OmitType, PickType } from '@nestjs/swagger';
import { UserCareer } from 'src/entity/user-career.entity';

export class CareerUpdateDto extends PickType(UserCareer, ['first_date', 'last_date', 'type']) {}
