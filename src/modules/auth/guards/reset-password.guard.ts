import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { RecoveryPasswordDto } from 'modules/auth/dtos/recovery-password.dto';
import { validateOrReject } from 'class-validator';
import { Request } from 'express';
import { plainToClass } from 'class-transformer';
import { AuthJwtService } from 'modules/auth/services/auth-jwt/auth-jwt.service';

@Injectable()
export class ResetPasswordGuard implements CanActivate {
  private readonly logger = new Logger(ResetPasswordGuard.name);

  constructor(private authJwt: AuthJwtService) {}

  /**
   * Decode and validate recovery token structure
   * @param context
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requestRef = context.switchToHttp().getRequest<Request>();

    const token = requestRef.headers.token as string;

    if (!token) {
      this.logger.error('Token not provided');
      throw new UnauthorizedException('Token not provided');
    }

    //validate token and set type
    const payload = await this.authJwt.verifyRecovery(token).catch((e) => {
      this.logger.error('Recovery token error: ' + e.message);
      throw new UnprocessableEntityException(e.message);
    });

    // Structure validation
    await validateOrReject(plainToClass(RecoveryPasswordDto, payload)).catch(
      () => {
        this.logger.log('Invalid payload structure');
        throw new UnprocessableEntityException('Invalid payload structure');
      },
    );

    this.logger.log('Recovery token is valid');

    // All validations successfully then populate authInfo
    requestRef.authInfo = payload;

    // Allows continuing with the flow
    return true;
  }
}
