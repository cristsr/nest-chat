import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtDto } from 'modules/auth/dto/login.dto';
import { CONFIG } from 'config/config-keys';
import { RecoveryPasswordDto } from 'modules/user/dto/recovery-password.dto';
import { enc, HmacSHA256 } from 'crypto-js';

@Injectable()
export class TokenService {
  constructor(private config: ConfigService, private jwt: JwtService) {}

  access(payload: any): JwtDto {
    const jwtExpiration = this.config.get(CONFIG.JWT_EXPIRATION_TIME);

    return {
      token: this.jwt.sign(payload, {
        secret: this.config.get(CONFIG.JWT_SECRET_KEY),
        expiresIn: jwtExpiration,
      }),
      tokenType: 'Bearer',
      expiresIn: jwtExpiration.slice(0, -1),
    };
  }

  refresh(payload: any): JwtDto {
    const refreshJwtExpiration = this.config.get(
      CONFIG.REFRESH_EXPIRATION_TIME,
    );

    return {
      token: this.jwt.sign(payload, {
        secret: this.config.get(CONFIG.REFRESH_SECRET_KEY),
      }),
      expiresIn: refreshJwtExpiration,
    };
  }

  recovery(user: string) {
    const recoveryExpSeconds = +this.config
      .get(CONFIG.RECOVERY_EXPIRATION_TIME)
      .slice(0, -1);

    const secret = this.config.get(CONFIG.RECOVERY_SECRET_KEY);

    const issuedAt = new Date().getTime();

    const expTime = new Date(issuedAt + recoveryExpSeconds * 1000).getTime();

    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const payload: RecoveryPasswordDto = {
      user,
      expTime,
      issuedAt,
    };

    // Stringify and encode the header
    const stringifiedHeader = enc.Utf8.parse(JSON.stringify(header));
    const encodedHeader = this.base64(stringifiedHeader);

    // Stringify and encode the payload
    const stringifiedPayload = enc.Utf8.parse(JSON.stringify(payload));
    const encodedPayload = this.base64(stringifiedPayload);

    // Sign the encoded header and mock-api
    const signature = HmacSHA256(`${encodedHeader}.${encodedPayload}`, secret);

    const result = this.base64(signature);
    console.log(result);
  }

  validateRecovery(token: string) {
    const secret = this.config.get(CONFIG.RECOVERY_SECRET_KEY);
    // Re-sign and encode the header and payload using the secret
    const signatureCheck = this.base64(HmacSHA256(token, secret));

    // Verify that the resulting signature is valid
    return token === signatureCheck;
  }

  /**
   * Return base64 encoded version of the given string
   *
   * @param source
   * @private
   */
  private base64(source: any): string {
    // Encode in classical base64
    // Return the base64 encoded string
    return (
      enc.Base64.stringify(source)
        // Remove padding equal characters
        .replace(/=+$/, '')

        // Replace characters according to base64url specifications
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
    );
  }
}
