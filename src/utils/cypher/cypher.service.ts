import { Inject, Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, scrypt } from 'crypto';
import { promisify } from 'util';
import { CypherConfig } from './cypher.module';
import { CYPHER_CONFIG } from './constants';

@Injectable()
export class CypherService {
  constructor(@Inject(CYPHER_CONFIG) private cypherConfig: CypherConfig) {}

  /**
   * Encrypt text with provided password and return hex string
   * @param textToEncrypt
   * @param password
   */
  async encrypt(textToEncrypt: string, password: string): Promise<string> {
    const key = await this.genKey(password);

    const cipher = createCipheriv(
      this.cypherConfig.algorithm,
      key,
      this.cypherConfig.iv,
    );

    const encryptedText = Buffer.concat([
      cipher.update(textToEncrypt),
      cipher.final(),
    ]);

    return encryptedText.toString('hex');
  }

  /**
   * Decrypt hex string with provided password and return utf8 string
   * @param encryptedText
   * @param password
   */
  async decrypt(encryptedText: string, password: string) {
    const key = await this.genKey(password);

    const buffer = Buffer.from(encryptedText, 'hex');

    const decipher = createDecipheriv(
      this.cypherConfig.algorithm,
      key,
      this.cypherConfig.iv,
    );

    const decryptedText = Buffer.concat([
      decipher.update(buffer),
      decipher.final(),
    ]);

    return decryptedText.toString('utf-8');
  }

  /**
   * Generate key
   * @param password
   * @private
   */
  private genKey(password: string): Promise<Buffer> {
    return promisify(scrypt)(
      password,
      'salt',
      this.cypherConfig.keylen,
    ) as Promise<Buffer>;
  }
}
