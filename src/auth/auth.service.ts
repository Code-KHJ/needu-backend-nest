import { HttpException, HttpStatus, Inject, Injectable, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { Repository } from 'typeorm';
import { Redis } from 'ioredis';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import * as jwt from 'jsonwebtoken';
import { LoginDto } from './dto/login.dto';
import bcrypt from 'bcrypt';
import { promisify } from 'util';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  async login(loginDto: LoginDto) {
    const { id, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { id: id } });

    if (!user) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }

    const payload: JwtPayloadDto = {
      id: id,
      nickname: user.nickname,
    };

    const { accessToken, refreshToken } = await this.getTokens(payload);

    const current = new Date().toISOString().slice(0, 10);
    user.login_date = new Date(current);
    await this.userRepository.save(user);

    return { accessToken, refreshToken };
  }

  async logout(userId: string) {
    const result = await this.redis.del(userId);
    if (result !== 1) {
      return false;
    }
    return true;
  }

  async refresh(userId: string, rt: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const validateRt = await this.validateRefrshToken(userId, rt);

    if (!validateRt) {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }

    const payload: JwtPayloadDto = {
      id: user.id,
      nickname: user.nickname,
    };

    const { accessToken, refreshToken } = await this.getTokens(payload);

    const current = new Date().toISOString().slice(0, 10);
    user.login_date = new Date(current);
    await this.userRepository.save(user);

    return { accessToken, refreshToken };
  }

  async validateRefrshToken(id: string, rt: string): Promise<boolean> {
    const data = await this.redis.get(id);
    if (rt !== data) {
      return false;
    }

    if (rt === data) {
      try {
        jwt.verify(rt, process.env.JWT_KEY);
        return true;
      } catch (err) {
        return false;
      }
    }
  }

  async validateUser(payload: JwtPayloadDto): Promise<User | null> {
    if (!payload.id) {
      return null;
    }
    return this.userRepository.findOneBy({ id: payload.id });
  }

  getTokens(payload: JwtPayloadDto) {
    const accessToken: string = jwt.sign(payload, process.env.JWT_KEY, {
      issuer: process.env.JWT_ISSUER,
      algorithm: process.env.JWT_ALGORITHM,
      expiresIn: process.env.JWT_EXPIRESIN,
    });

    const refreshToken: string = jwt.sign({ id: payload.id }, process.env.JWT_KEY, {
      issuer: process.env.JWT_ISSUER,
      algorithm: process.env.JWT_ALGORITHM,
      expiresIn: process.env.JWT_EXPIRESIN_REFRESH,
    });

    this.redis.set(payload.id, refreshToken);

    return { accessToken, refreshToken };
  }
}
