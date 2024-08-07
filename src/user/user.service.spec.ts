import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { User } from 'src/entity/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserLoginDto } from './dto/user-login.dto';
import { UserDuplicDto } from './dto/user-duplic.dto';
import { UserSignupDto } from './dto/user-create.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Redis } from 'ioredis';
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ConfigModule } from '@nestjs/config';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;
  let redis: Redis;
  const usersRepositoryToken = getRepositoryToken(User);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        Redis,
        {
          provide: usersRepositoryToken,
          useValue: {
            findOneBy: jest.fn(),
            createQueryBuilder: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: 'REDIS_CLIENT',
          useValue: {
            set: jest.fn(),
          },
        },
      ],
      imports: [ConfigModule.forRoot()],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(usersRepositoryToken);
    redis = module.get<Redis>('REDIS_CLIENT');
  });

  it('usersService should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('usersRepository should be defined', () => {
    expect(userRepository).toBeDefined();
  });

  describe('로그인 테스트', () => {
    it('throw NOT_FOUND : 존재하지 않는 아이디', async () => {
      const userLoginDto: UserLoginDto = {
        id: '없는계정@example.com',
        password: 'password123',
      };
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(undefined);

      try {
        await userService.login(userLoginDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.response).toEqual('NOT_FOUND');
        expect(error.status).toEqual(HttpStatus.NOT_FOUND);
      }
    });

    it('throw UNAUTHORIZED : 아이디와 비밀번호 일치하지 않음', async () => {
      const userLoginDto: UserLoginDto = {
        id: 'test@test.com',
        password: 'invalidpassword',
      };

      const salt = bcrypt.genSaltSync(parseInt(process.env.SALT_ROUNDS));
      const existingUser = new User();
      existingUser.user_id = 'test@test.com';
      existingUser.password = await bcrypt.hashSync('validpassword', salt);

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(existingUser);

      try {
        await userService.login(userLoginDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.response).toEqual('UNAUTHORIZED');
        expect(error.status).toEqual(HttpStatus.UNAUTHORIZED);
      }
    });

    it('success Login : 로그인 성공', async () => {
      const userLoginDto: UserLoginDto = {
        id: 'test@test.com',
        password: 'validpassword',
      };

      const salt = bcrypt.genSaltSync(parseInt(process.env.SALT_ROUNDS));
      const existingUser = new User();
      existingUser.user_id = 'test@test.com';
      existingUser.nickname = '니쥬';
      existingUser.password = await bcrypt.hashSync('validpassword', salt);

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(existingUser);

      const payload = {
        id: existingUser.user_id,
        nickname: existingUser.nickname,
      };
      const accessToken: string = jwt.sign(payload, process.env.JWT_KEY, {
        issuer: process.env.JWT_ISSUER,
        algorithm: process.env.JWT_ALGORITHM,
        expiresIn: process.env.JWT_EXPIRESIN,
      });

      const refreshToken: string = jwt.sign({}, process.env.JWT_KEY, {
        issuer: process.env.JWT_ISSUER,
        algorithm: process.env.JWT_ALGORITHM,
        expiresIn: process.env.JWT_EXPIRESIN_REFRESH,
      });

      jest.spyOn(redis, 'set').mockResolvedValue(undefined);

      const result = await userService.login(userLoginDto);

      expect(result.accessToken).toEqual(accessToken);
      expect(result.refreshToken).toEqual(refreshToken);
    });
  });

  describe('중복체크 테스트', () => {
    it('중복되어 사용불가', async () => {
      const userDuplicDto: UserDuplicDto = {
        item: 'id',
        value: 'test@test.com',
      };
      const mockSelectQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({}),
      };
      jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValue(mockSelectQueryBuilder as any);

      const result = await userService.duplic(userDuplicDto);
      expect(result).toBe(false);
    });
    it('중복없음 사용가능', async () => {
      const userDuplicDto: UserDuplicDto = {
        item: 'id',
        value: 'valid@test.com',
      };

      const mockSelectQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValue(mockSelectQueryBuilder as any);

      const result = await userService.duplic(userDuplicDto);
      expect(result).toBe(true);
    });
  });
});
