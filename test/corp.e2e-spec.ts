import { INestApplication, Delete } from '@nestjs/common';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import cookieParser from 'cookie-parser';

describe('CorpController (e2e)', () => {
  let app: INestApplication;
  let token_view;
  let token;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();

    const response = await request(app.getHttpServer()).post('/api/auth/login').send({ id: 'test1@test.com', password: 'test1234' });
    token = response.headers['set-cookie'][0].split(';')[0];

    const response_view = await request(app.getHttpServer()).post('/api/auth/login').send({ id: 'test@test.com', password: 'test1234' });
    token_view = response_view.headers['set-cookie'][0].split(';')[0];
  });

  afterAll(async () => {
    await app.close();
  });

  describe('기관 등록 테스트', () => {
    it('/corp (POST): 201', () => {
      return request(app.getHttpServer())
        .post('/api/corp')
        .set('Cookie', token)
        .send({
          corp_name: 'testcorp',
          city: '서울',
          gugun: '양천구',
        })
        .expect(201);
    });
    it('/corp (POST): 400 필수값 누락', () => {
      return request(app.getHttpServer())
        .post('/api/corp')
        .set('Cookie', token)
        .send({
          corp_name: null,
          city: '서울',
          gugun: '양천구',
        })
        .expect(400);
    });
    it('/corp (POST): 401 권한 없음', () => {
      return request(app.getHttpServer())
        .post('/api/corp')
        .send({
          corp_name: 'testcorp',
          city: '서울',
          gugun: '양천구',
        })
        .expect(401);
    });
  });

  describe('기관 조회 테스트', () => {
    it('/corp (GET): 200', () => {
      return request(app.getHttpServer())
        .get('/api/corp')
        .query({
          page: 1,
          city: '서울',
        })
        .expect(200);
    });

    it('/corp/:name (GET): 200 단일기관 조회', () => {
      return request(app.getHttpServer()).get('/api/corp/testcorp').expect(200);
    });

    it('/corp/:name (GET): 404 존재하지 않는 기관', () => {
      return request(app.getHttpServer()).get('/api/corp/unvalidcorp').expect(404);
    });
  });

  describe('기관 수정 테스트', () => {
    it('/corp/:name (PATCH): 403 권한 없음', () => {
      return request(app.getHttpServer())
        .patch('/api/corp/testcorp')
        .set('Cookie', token_view)
        .send({
          score: 4,
          hashtag_top1: '#반차/반반차',
          hashtag_top2: '#간식제공',
          review_cnt: 2,
        })
        .expect(403);
    });
  });

  describe('기관 삭제 테스트', () => {
    it('/corp/:name (DELETE): 403 권한 없음', () => {
      return request(app.getHttpServer()).delete('/api/corp/testcorp').set('Cookie', token).expect(403);
    });

    it('/corp/:name (DELETE): 200', () => {
      return request(app.getHttpServer()).delete('/api/corp/testcorp').set('Cookie', token_view).expect(200);
    });

    it('/corp/:name (DELETE): 404 존재하지 않는 기관', () => {
      return request(app.getHttpServer()).delete('/api/corp/testcorp').set('Cookie', token_view).expect(404);
    });
  });
});
