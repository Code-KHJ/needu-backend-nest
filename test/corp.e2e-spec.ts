import { INestApplication, Delete } from '@nestjs/common';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

describe('CorpController (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('기관 등록 테스트', () => {
    it('/corp (POST): 201', () => {
      return request(app.getHttpServer())
        .post('/api/corp')
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
        .send({
          corp_name: null,
          city: '서울',
          gugun: '양천구',
        })
        .expect(400);
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
    it('/corp/:name (PATCH): 200', () => {
      return request(app.getHttpServer())
        .patch('/api/corp/testcorp')
        .send({
          score: 4,
          hashtag_top1: '#반차/반반차',
          hashtag_top2: '#간식제공',
          review_cnt: 2,
        })
        .expect(200);
    });

    it('/corp/:name (PATCH): 404 존재하지 않는 기관', () => {
      return request(app.getHttpServer())
        .patch('/api/corp/unvalidcorp')
        .send({
          score: 4,
          hashtag_top1: '#반차/반반차',
          hashtag_top2: '#간식제공',
          review_cnt: 2,
        })
        .expect(404);
    });
  });

  describe('기관 삭제 테스트', () => {
    it('/corp/:name (DELETE): 200', () => {
      return request(app.getHttpServer()).delete('/api/corp/testcorp').expect(200);
    });

    it('/corp/:name (DELETE): 404 존재하지 않는 기관', () => {
      return request(app.getHttpServer()).delete('/api/corp/testcorp').expect(404);
    });
  });
});
