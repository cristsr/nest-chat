import { Test, TestingModule } from '@nestjs/testing';
import { RecoveryPasswordRepository } from './recovery-password-repository';

describe('RecoveryPasswordRepository', () => {
  let service: RecoveryPasswordRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecoveryPasswordRepository],
    }).compile();

    service = module.get<RecoveryPasswordRepository>(
      RecoveryPasswordRepository,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
