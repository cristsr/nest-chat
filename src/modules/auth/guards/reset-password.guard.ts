import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CONFIG } from 'config/config-keys';
import { RecoveryPasswordDto } from 'modules/user/dto/recovery-password.dto';
import { validateOrReject } from 'class-validator';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ResetPasswordGuard implements CanActivate {
  private readonly logger = new Logger(ResetPasswordGuard.name);

  constructor(private config: ConfigService, private jwtService: JwtService) {}

  /**
   * Decode and validate recovery token structure
   * @param context
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requestRef = context.switchToHttp().getRequest<Request>();

    const token = requestRef.headers.token as string;

    if (!token) {
      this.logger.error('Token not provided');
      throw new BadRequestException('Token not provided');
    }

    const secret = this.config.get(CONFIG.RECOVERY_SECRET_KEY);

    //validate token and set type
    const payload = await this.jwtService
      .verifyAsync(token, { secret })
      .catch((e) => {
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
