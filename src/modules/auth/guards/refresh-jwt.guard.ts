import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UserDto } from 'modules/user/dtos/user.dto';
import { Request } from 'express';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { AuthJwtService } from 'modules/auth/services/auth-jwt/auth-jwt.service';

@Injectable()
export class RefreshJwtGuard implements CanActivate {
  private readonly logger = new Logger(RefreshJwtGuard.name);

  constructor(private authJwt: AuthJwtService) {}

  /**
   * Decode and validate refresh token
   * @param context
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requestRef = context.switchToHttp().getRequest<Request>();

    const refreshToken = requestRef.headers.refresh as string;

    if (!refreshToken) {
      this.logger.error('Refresh token not provided');
      throw new UnauthorizedException('Refresh token is required');
    }

    const payload = await this.authJwt
      .verifyRefresh<UserDto>(refreshToken)
      .catch(() => {
        this.logger.error('Invalid refresh token');
        throw new UnprocessableEntityException('Invalid refresh token');
      });

    // Structure validation
    await validateOrReject(plainToClass(UserDto, payload)).catch(() => {
      this.logger.log('Invalid payload structure');
      throw new UnprocessableEntityException('Invalid payload structure');
    });

    this.logger.log('Refresh token is valid', payload);

    // All validations successfully then populate user
    requestRef.user = {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      nickname: payload.nickname,
    } as UserDto;

    // Allows continuing with the flow
    return true;
  }
}
