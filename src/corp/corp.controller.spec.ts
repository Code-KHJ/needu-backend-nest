import { Test, TestingModule } from '@nestjs/testing';
import { CorpController } from './corp.controller';

describe('CorpController', () => {
  let controller: CorpController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CorpController],
    }).compile();

    controller = module.get<CorpController>(CorpController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
