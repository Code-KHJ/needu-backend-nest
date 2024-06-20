import { OmitType } from '@nestjs/swagger';
import { UserCareer } from 'src/entity/user-career.entity';

export class CareerCreateDto extends OmitType(UserCareer, ['no']) {}
