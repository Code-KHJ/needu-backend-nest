import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import nunjucks from 'nunjucks';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    nunjucks.configure('public', {
      autoescape: true,
      watch: true,
      express: app,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {});

  afterEach(async () => {});

  describe('로그인 테스트', () => {
    it('/login (GET): 200', () => {
      return request(app.getHttpServer()).get('/user/login').expect(200);
    });

    it('/login (POST): 200', () => {
      return request(app.getHttpServer())
        .post('/user/login')
        .send({
          id: 'test@test.com',
          password: 'test1234',
        })
        .expect(200);
    });

    it('/login (POST): 500 입력값 없음', () => {
      return request(app.getHttpServer())
        .post('/user/login')
        .send({
          id: 'test@test.com',
        })
        .expect(500);
    });

    it('/login (POST): 401 계정 정보 불일치', () => {
      return request(app.getHttpServer())
        .post('/user/login')
        .send({
          id: 'test@test.com',
          password: 'unvalid',
        })
        .expect(401);
    });
  });
  describe('회원가입 테스트', () => {
    it('/signup (GET): 200', () => {
      return request(app.getHttpServer()).get('/user/signup').expect(200);
    });
    it('/signup/duplic (POST): 중복되지 않음', () => {
      return request(app.getHttpServer())
        .post('/user/signup/duplic')
        .send({
          item: 'id',
          value: 'valid@test.com',
        })
        .expect('true');
    });
    it('/signup/duplic (POST): 중복', () => {
      return request(app.getHttpServer())
        .post('/user/signup/duplic')
        .send({
          item: 'id',
          value: 'test@test.com',
        })
        .expect('false');
    });
    it('/signup (POST): 200', () => {
      return request(app.getHttpServer())
        .post('/user/signup')
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
        .delete('/user/' + 'valid@test.com')
        .expect(200);
    });

    it('/:id (DELETE) : 404 없는 아이디', () => {
      return request(app.getHttpServer())
        .delete('/user/' + 'valid@test.com')
        .expect(404);
    });
  });
});
