import { Inject, Injectable, Logger } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { CypherConfig } from './cypher.module';
import { CYPHER_CONFIG } from './constants';

@Injectable()
export class CypherService {
  constructor(@Inject(CYPHER_CONFIG) private cypherConfig: CypherConfig) {}

  async encrypt(textToEncrypt): Promise<string> {
    const iv = randomBytes(this.cypherConfig.iv);
    const password = this.cypherConfig.key;

    // The key length is dependent on the algorithm.
    // In this case for aes256, it is 32 bytes.
    const key = (await promisify(scrypt)(
      password,
      'salt',
      this.cypherConfig.keylen,
    )) as Buffer;
    const cipher = createCipheriv(this.cypherConfig.algorithm, key, iv);

    const encryptedText = Buffer.concat([
      cipher.update(textToEncrypt),
      cipher.final(),
    ]);

    Logger.log('encripted text ');
    Logger.log(encryptedText);

    return encryptedText.toString('utf-8');
  }

  async decrypt(encryptedText: string) {
    const iv = randomBytes(this.cypherConfig.iv);
    const password = this.cypherConfig.key;

    const decipher = createDecipheriv(
      this.cypherConfig.algorithm,
      password,
      iv,
    );

    const decryptedText = Buffer.concat([
      decipher.update(encryptedText as any),
      decipher.final(),
    ]);

    Logger.log('decrypted text ');
    Logger.log(decryptedText);
  }
}
