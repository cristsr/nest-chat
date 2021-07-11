import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CONFIG } from 'config/config-keys';
import { UserDto } from 'modules/user/dto/user.dto';

@Injectable()
export class RefreshJwtGuard implements CanActivate {
  private readonly logger = new Logger(RefreshJwtGuard.name);

  constructor(private jwt: JwtService, private config: ConfigService) {}

  canActivate(context: ExecutionContext): Observable<boolean> {
    const ctx = context.switchToHttp();
    const requestRef = ctx.getRequest();

    const refreshToken = requestRef.headers.refresh;

    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    const payload = this.jwt.verify(refreshToken, {
      secret: this.config.get(CONFIG.REFRESH_SECRET_KEY),
    });

    if (payload) {
      // set user to request ref
      requestRef.user = {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        nickname: payload.nickname,
      } as UserDto;

      return of(true);
    }

    //
    return of(false);
  }
}
