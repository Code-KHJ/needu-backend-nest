import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import nunjucks from 'nunjucks';
import cookieParser from 'cookie-parser';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
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

  describe('회원가입 테스트', () => {
    it('/api/user/duplic (POST): 중복되지 않음', () => {
      return request(app.getHttpServer())
        .post('/api/user/duplic')
        .send({
          item: 'id',
          value: 'valid@test.com',
        })
        .expect('true');
    });
    it('/api/user/duplic (POST): 중복', () => {
      return request(app.getHttpServer())
        .post('/api/user/duplic')
        .send({
          item: 'id',
          value: 'test@test.com',
        })
        .expect('false');
    });
    it('/api/user/signup (POST): 201', () => {
      return request(app.getHttpServer())
        .post('/api/user/signup')
        .send({
          id: 'valid@test.com',
          password: 'test1234',
          phonenumber: '01012341234',
          nickname: 'validtest',
          policy: true,
          personal_info: true,
          marketing_email: true,
          marketing_SMS: true,
          info_period: '탈퇴시',
        })
        .expect(201);
    });
    it('/api/user/signup (POST): 401 아이디 중복', () => {
      return request(app.getHttpServer())
        .post('/api/user/signup')
        .send({
          id: 'valid@test.com',
          password: 'test1234',
          phonenumber: '01012341234',
          nickname: 'validtest',
          policy: true,
          personal_info: true,
          marketing_email: true,
          marketing_SMS: true,
          info_period: '탈퇴시',
        })
        .expect(401);
    });
  });
  describe('회원탈퇴 테스트', () => {
    let token;
    beforeAll(async () => {
      const response = await request(app.getHttpServer()).post('/api/auth/login').send({ id: 'valid@test.com', password: 'test1234' });
      token = response.headers['set-cookie'][0].split(';')[0];
    });

    it('/api/user (DELETE) : 200', () => {
      return request(app.getHttpServer())
        .delete('/api/user')
        .set('Cookie', token)
        .send({
          password: 'test1234',
        })
        .expect(200);
    });

    it('/api/user (DELETE) : 500 없는 아이디', () => {
      return request(app.getHttpServer())
        .delete('/api/user')
        .set('Cookie', token)
        .send({
          password: 'test1234',
        })
        .expect(500);
    });
  });
});
