import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import nunjucks from 'nunjucks';
import cookieParser from 'cookie-parser';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let at;
  let rt;
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

    const response = await request(app.getHttpServer()).post('/api/auth/login').send({ id: 'test@test.com', password: 'test1234' });
    at = response.headers['set-cookie'][0].split(';')[0];
    rt = response.headers['set-cookie'][1].split(';')[0];
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {});

  afterEach(async () => {});

  describe('로그인 테스트', () => {
    it('/api/auth/login (POST): 200', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          id: 'test@test.com',
          password: 'test1234',
        })
        .expect(200);
    });

    it('/api/auth/login (POST): 500 입력값 없음', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          id: 'test@test.com',
        })
        .expect(500);
    });

    it('/api/auth/login (POST): 401 계정 정보 불일치', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          id: 'test@test.com',
          password: 'unvalid',
        })
        .expect(401);
    });
  });

  describe('토큰 리프레시 테스트', () => {
    it('/api/auth/refersh (POST): 200', () => {
      return request(app.getHttpServer()).post('/api/auth/refresh').set('Cookie', rt).expect(200);
    });

    it('/api/auth/refersh (POST): 401', () => {
      return request(app.getHttpServer()).post('/api/auth/refresh').expect(401);
    });
  });

  describe('로그아웃 테스트', () => {
    it('/api/auth/logout (POST): 200', () => {
      return request(app.getHttpServer()).post('/api/auth/logout').set('Cookie', at).expect(200);
    });

    it('/api/auth/logout (POST): 401', () => {
      return request(app.getHttpServer()).post('/api/auth/logout').expect(401);
    });
  });
});
