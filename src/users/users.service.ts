import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { UserLoginDto } from './dto/user-login.dto';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}
  async login(userLoginDto: UserLoginDto) {
    const { id, password } = userLoginDto;
    const user = await this.usersRepository.findOneBy({
      id: id,
    });
    if (!user) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }

    // try{
    //   const jwt =
    // }
    return user;
  }
}
