import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { RedisModule } from '../redis/redis.module';
import { Axios } from 'axios';

@Module({
  imports: [TypeOrmModule.forFeature([User]), RedisModule, Axios],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
