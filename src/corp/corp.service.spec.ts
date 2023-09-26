import { Test, TestingModule } from '@nestjs/testing';
import { CorpService } from './corp.service';

describe('CorpService', () => {
  let service: CorpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CorpService],
    }).compile();

    service = module.get<CorpService>(CorpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
