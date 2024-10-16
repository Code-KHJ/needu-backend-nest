import { Global, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from 'src/shared/shared.module';
import { SharedService } from 'src/shared/shared.service';
import { User } from '../entity/user.entity';
import { RedisModule } from '../redis/redis.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AtStrategy } from './strategies/at.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { KakaoStrategy } from './strategies/kakao.strategy';
import { RtStrategy } from './strategies/rt.strategy';
import { UtilService } from 'src/util/util.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User]), PassportModule, RedisModule, SharedModule],
  providers: [AtStrategy, RtStrategy, KakaoStrategy, GoogleStrategy, AuthService, UtilService, SharedService],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
