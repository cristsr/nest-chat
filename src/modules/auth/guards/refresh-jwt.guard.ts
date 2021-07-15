import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CONFIG } from 'config/config-keys';
import { UserDto } from 'modules/user/dto/user.dto';
import { Request } from 'express';

@Injectable()
export class RefreshJwtGuard implements CanActivate {
  private readonly logger = new Logger(RefreshJwtGuard.name);

  constructor(private jwt: JwtService, private config: ConfigService) {}

  /**
   * Decode and validate refresh token
   * @param context
   */
  canActivate(context: ExecutionContext): boolean {
    const requestRef = context.switchToHttp().getRequest<Request>();

    const refreshToken = requestRef.headers.refresh as string;

    if (!refreshToken) {
      this.logger.error('Refresh token not provided');
      throw new BadRequestException('Refresh token is required');
    }

    let payload: any;

    try {
      // decode and verify refresh token
      payload = this.jwt.verify(refreshToken, {
        secret: this.config.get(CONFIG.REFRESH_SECRET_KEY),
      });
    } catch (e) {
      this.logger.error('Refresh token is invalid');

      throw new UnprocessableEntityException('Invalid refresh token');
    }

    if (!payload) {
      this.logger.error('Token verification failure');
      throw new UnauthorizedException('Token verification failure');
    }

    this.logger.log('Refresh token is valid');

    // set user to request ref
    requestRef.user = {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      nickname: payload.nickname,
    } as UserDto;

    return true;
  }
}
