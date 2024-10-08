import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { RedisModule } from '../redis/redis.module';
import { Axios } from 'axios';
import { UserCareer } from 'src/entity/user-career.entity';
import { MulterModule } from '@nestjs/platform-express';
import { multerOptionsFactory } from 'src/multer.options.factory';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MulterModule.registerAsync({ imports: [ConfigModule], useFactory: multerOptionsFactory }),
    TypeOrmModule.forFeature([User, UserCareer]),
    RedisModule,
    Axios,
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
