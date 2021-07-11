import { DynamicModule, Module } from '@nestjs/common';
import { CypherService } from './cypher.service';
import { CYPHER_CONFIG } from './constants';

export interface CypherConfig {
  algorithm: string;
  keylen: number;
  iv: string;
}

@Module({})
export class CypherModule {
  static register(config: CypherConfig): DynamicModule {
    return {
      module: CypherModule,
      providers: [
        {
          provide: CYPHER_CONFIG,
          useValue: config,
        },
        CypherService,
      ],
      exports: [CypherService],
    };
  }
}
