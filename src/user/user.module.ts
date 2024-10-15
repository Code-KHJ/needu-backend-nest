import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Axios } from 'axios';
import { UserCareer } from 'src/entity/user-career.entity';
import { multerOptionsFactory } from 'src/multer.options.factory';
import { UtilService } from 'src/util/util.service';
import { User } from '../entity/user.entity';
import { RedisModule } from '../redis/redis.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ActivityType } from 'src/entity/activity-type.entity';
import { ActivityLog } from 'src/entity/activity-log.entity';
import { SharedModule } from 'src/shared/shared.module';
import { SharedService } from 'src/shared/shared.service';

@Module({
  imports: [
    MulterModule.registerAsync({ imports: [ConfigModule], useFactory: multerOptionsFactory }),
    TypeOrmModule.forFeature([User, UserCareer, ActivityType, ActivityLog]),
    RedisModule,
    Axios,
    SharedModule,
  ],
  providers: [UserService, UtilService, SharedService],
  controllers: [UserController],
})
export class UserModule {}
