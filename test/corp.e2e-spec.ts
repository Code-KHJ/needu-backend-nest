import { INestApplication } from '@nestjs/common';
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
  });

  describe('기관 등록 테스트', () => {
    it('/corp (POST): 201', () => {
      return request(app.getHttpServer())
        .post('/api/corp')
        .send({
          corp_name: '테스트기관1',
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
});
