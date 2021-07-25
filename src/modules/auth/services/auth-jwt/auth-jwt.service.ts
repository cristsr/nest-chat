import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CONFIG } from 'config/config-keys';
import { JwtDto } from 'modules/auth/dto/login.dto';
import { JsonWebTokenError } from 'jsonwebtoken';

@Injectable()
export class AuthJwtService {
  constructor(private jwtService: JwtService, private config: ConfigService) {}

  async signAccess(payload: any): Promise<JwtDto> {
    const secret = this.config.get(CONFIG.JWT_SECRET_KEY);
    const expiresIn = this.config.get(CONFIG.JWT_EXPIRATION_TIME);

    return this.jwtService
      .signAsync(payload, {
        secret,
        expiresIn,
      })
      .then((token) => ({
        token,
        tokenType: 'Bearer',
        expiresIn: expiresIn.slice(0, -1),
      }));
  }

  async signRefresh(payload: any): Promise<JwtDto> {
    const secret = this.config.get(CONFIG.REFRESH_SECRET_KEY);

    return this.jwtService
      .signAsync(payload, {
        secret,
      })
      .then((token) => ({
        token,
      }));
  }

  async signRecovery(payload: any): Promise<JwtDto> {
    const secret = this.config.get(CONFIG.RECOVERY_SECRET_KEY);
    const expiresIn = this.config.get(CONFIG.RECOVERY_EXPIRATION_TIME);

    return this.jwtService
      .signAsync(payload, {
        secret,
        expiresIn,
      })
      .then((token) => ({
        token,
        expiresIn: expiresIn.slice(0, -1),
      }));
  }

  // eslint-disable-next-line
  async verifyAccess<T extends object = any>(token: string): Promise<T> {
    return this.jwtService.verifyAsync<T>(token, {
      secret: this.config.get(CONFIG.JWT_SECRET_KEY),
    });
  }

  // eslint-disable-next-line
  async verifyRefresh<T extends object = any>(token: string): Promise<T> {
    return this.jwtService.verifyAsync<T>(token, {
      secret: this.config.get(CONFIG.REFRESH_SECRET_KEY),
    });
  }

  // eslint-disable-next-line
  async verifyRecovery<T extends object = any>(token: string): Promise<T> {
    return this.jwtService.verifyAsync<T>(token, {
      secret: this.config.get(CONFIG.RECOVERY_SECRET_KEY),
    });
  }
}
