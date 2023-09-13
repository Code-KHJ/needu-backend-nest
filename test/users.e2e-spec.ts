import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import nunjucks from 'nunjucks';
import { DataSource } from 'typeorm';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let queryRunner;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dataSource = app.get<DataSource>(DataSource);

    nunjucks.configure('public', {
      autoescape: true,
      watch: true,
      express: app,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
    } catch (error) {
      console.log(error);
    }
  });

  afterEach(async () => {
    try {
      await queryRunner.rollbackTransaction();
    } catch (error) {
      console.log(error);
    }
  });

  describe('로그인 테스트', () => {
    it('/login (GET): 200', () => {
      return request(app.getHttpServer()).get('/users/login').expect(200);
    });

    it('/login (POST): 200', () => {
      return request(app.getHttpServer())
        .post('/users/login')
        .send({
          id: 'test@test.com',
          password: 'test1234',
        })
        .expect(200);
    });

    it('/login (POST): 500 입력값 없음', () => {
      return request(app.getHttpServer())
        .post('/users/login')
        .send({
          id: 'test@test.com',
        })
        .expect(500);
    });

    it('/login (POST): 401 계정 정보 불일치', () => {
      return request(app.getHttpServer())
        .post('/users/login')
        .send({
          id: 'test@test.com',
          password: 'unvalid',
        })
        .expect(401);
    });
  });
  describe('회원가입 테스트', () => {
    it('/signup (GET): 200', () => {
      return request(app.getHttpServer()).get('/users/signup').expect(200);
    });
    it('/signup/duplic (POST): 중복되지 않음', () => {
      return request(app.getHttpServer())
        .post('/users/signup/duplic')
        .send({
          item: 'id',
          value: 'valid@test.com',
        })
        .expect('true');
    });
    it('/signup/duplic (POST): 중복', () => {
      return request(app.getHttpServer())
        .post('/users/signup/duplic')
        .send({
          item: 'id',
          value: 'test@test.com',
        })
        .expect('false');
    });
    it('/signup (POST): 200', () => {
      return request(app.getHttpServer())
        .post('/users/signup')
        .send({
          id: 'valid@test.com',
          password: 'test1234',
          phonenumber: '01012341234',
          nickname: 'validtest',
          check_2: true,
          check_3: true,
          check_4: true,
          check_5: true,
          radio1: '탈퇴시',
        })
        .expect(200);
    });
  });
  describe('회원탈퇴 테스트', () => {
    it('/:id (DELETE) : 200', () => {
      return request(app.getHttpServer())
        .delete('/users/' + 'valid@test.com')
        .expect(200);
    });

    // it('/:id (DELETE) : 404 없는 아이디', () => {
    //   return request(app.getHttpServer())
    //     .delete('/users/' + 'valid@test.com')
    //     .expect(400);
    // });
  });
});
