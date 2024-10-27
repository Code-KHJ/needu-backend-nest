import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Redis } from 'ioredis';
import * as jwt from 'jsonwebtoken';
import { SharedService } from 'src/shared/shared.service';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { GoogleLoginDto } from './dto/google-login.dto';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { JwtResponseDto } from './dto/jwt-response.dto';
import { KakaoLoginDto } from './dto/kakao-login.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
    private readonly sharedService: SharedService,
  ) {}

  async login(loginDto: LoginDto) {
    const { user_id, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { user_id: user_id } });

    if (!user) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }

    const payload: JwtPayloadDto = {
      user_id: user_id,
      nickname: user.nickname,
    };

    const { accessToken, refreshToken } = await this.getTokens(payload);

    const current = new Date().toISOString().slice(0, 10);
    user.login_date = new Date(current);
    await this.userRepository.save(user);

    this.sharedService.addPoint(user.id, 2);

    const result = {
      id: user.id,
      user_id: user.user_id,
      nickname: user.nickname,
      authority: user.authority,
      profile_image: user.profile_image,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };

    return result;
  }

  async googleLogin(googleLoginDto: GoogleLoginDto) {
    const { id, nickname } = googleLoginDto;
    let user = await this.userRepository.findOne({ where: { user_id: id } });

    if (!user) {
      user = this.userRepository.create({
        user_id: id,
        password: null,
        phonenumber: null,
        nickname: nickname,
        policy: true,
        personal_info: true,
        marketing_email: true,
        marketing_SMS: true,
        google: true,
      });
      await this.userRepository.save(user);
      this.sharedService.addPoint(user.id, 1);
    }
    if (!user.google) {
      user.google = true;
    }
    const payload: JwtPayloadDto = {
      user_id: id,
      nickname: nickname,
    };

    const { accessToken, refreshToken } = await this.getTokens(payload);

    const current = new Date().toISOString().slice(0, 10);
    user.login_date = new Date(current);
    await this.userRepository.save(user);

    this.sharedService.addPoint(user.id, 2);

    const result = {
      id: user.user_id,
      nickname: user.nickname,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };

    return result;
  }

  async kakaoLogin(kakaoLoginDto: KakaoLoginDto) {
    const { id, nickname, phonenumber, marketing } = kakaoLoginDto;

    let user = await this.userRepository.findOne({ where: { user_id: id } });
    if (!user) {
      user = this.userRepository.create({
        user_id: id,
        password: null,
        phonenumber: phonenumber,
        nickname: nickname,
        policy: true,
        personal_info: true,
        marketing_email: marketing,
        marketing_SMS: marketing,
        kakao: true,
      });
      await this.userRepository.save(user);
      this.sharedService.addPoint(user.id, 1);
    }
    if (!user.kakao) {
      user.kakao = true;
    }
    const payload: JwtPayloadDto = {
      user_id: id,
      nickname: nickname,
    };

    const { accessToken, refreshToken } = await this.getTokens(payload);

    const current = new Date().toISOString().slice(0, 10);
    user.login_date = new Date(current);
    await this.userRepository.save(user);

    this.sharedService.addPoint(user.id, 2);

    const result = {
      id: user.user_id,
      nickname: user.nickname,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };

    return result;
  }

  async logout(userId: string) {
    const result = await this.redis.del(userId);
    if (result !== 1) {
      return false;
    }
    return true;
  }

  async refresh(userId: string, rt: string) {
    const user = await this.userRepository.findOne({ where: { user_id: userId } });

    if (!user) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    const validateRt = await this.validateRefrshToken(userId, rt);

    if (!validateRt) {
      return { msg: 'delete token' };
    }

    const payload: JwtPayloadDto = {
      user_id: user.user_id,
      nickname: user.nickname,
    };

    const { accessToken, refreshToken } = await this.getTokens(payload);

    const current = new Date().toISOString().slice(0, 10);
    user.login_date = new Date(current);
    await this.userRepository.save(user);

    this.sharedService.addPoint(user.id, 2);

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

  async validateUser(payload: JwtPayloadDto): Promise<JwtResponseDto | null> {
    if (!payload.user_id) {
      return null;
    }
    const user = await this.userRepository.findOneBy({ user_id: payload.user_id });
    return new JwtResponseDto(user);
  }

  getTokens(payload: JwtPayloadDto) {
    const accessToken: string = jwt.sign(payload, process.env.JWT_KEY, {
      issuer: process.env.JWT_ISSUER,
      algorithm: process.env.JWT_ALGORITHM,
      expiresIn: process.env.JWT_EXPIRESIN,
    });

    const refreshToken: string = jwt.sign({ id: payload.user_id }, process.env.JWT_KEY, {
      issuer: process.env.JWT_ISSUER,
      algorithm: process.env.JWT_ALGORITHM,
      expiresIn: process.env.JWT_EXPIRESIN_REFRESH,
    });

    this.redis.set(payload.user_id, refreshToken);

    return { accessToken, refreshToken };
  }
}
