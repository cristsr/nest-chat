import { Test, TestingModule } from '@nestjs/testing';
import { Sockets } from './sockets';

describe('Sockets', () => {
  let provider: Sockets;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Sockets],
    }).compile();

    provider = module.get<Sockets>(Sockets);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
