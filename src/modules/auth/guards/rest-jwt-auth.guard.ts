import {
  BadRequestException,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'modules/auth/decorators/public';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CONFIG } from 'config/config-keys';

@Injectable()
export class RestJwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    if (context.getHandler().name === 'refreshToken') {
      const ctx = context.switchToHttp();
      const requestRef = ctx.getRequest();

      if (!requestRef.headers.refresh) {
        throw new BadRequestException('Refresh token is required');
      }

      requestRef.user = this.refreshTokenIsValid(requestRef.headers.refresh);
      return true;
    }

    return super.canActivate(context);
  }

  refreshTokenIsValid(token): any {
    try {
      return this.jwtService.verify(token, {
        secret: this.config.get(CONFIG.JWT_SECRET_KEY),
      });
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
