import { Global, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AtStrategy } from './strategies/at.strategy';
import { RtStrategy } from './strategies/rt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { AuthService } from './auth.service';
import { RedisModule } from '../redis/redis.module';
import { AuthController } from './auth.controller';
import { KakaoStrategy } from './strategies/kakao.strategy';
import { GoogleStrategy } from './strategies/google.strategy';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User]), PassportModule, RedisModule],
  providers: [AtStrategy, RtStrategy, KakaoStrategy, GoogleStrategy, AuthService],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
