import { Test, TestingModule } from '@nestjs/testing';
import { Store } from './store.service';

describe('StoreService', () => {
  let service: Store<any>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Store],
    }).compile();

    service = module.get<Store<any>>(Store);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
