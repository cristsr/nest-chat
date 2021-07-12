import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CypherService } from 'utils/cypher/cypher.service';
import { CONFIG } from 'config/config-keys';
import { RecoveryPasswordDto } from 'modules/user/dto/recovery-password.dto';
import { validateOrReject } from 'class-validator';
import { Request } from 'express';

@Injectable()
export class ResetPasswordGuard implements CanActivate {
  private readonly logger = new Logger(ResetPasswordGuard.name);

  constructor(private config: ConfigService, private cypher: CypherService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.log('start guard execution: ' + ResetPasswordGuard.name);
    const requestRef = context.switchToHttp().getRequest<Request>();

    const token = requestRef.headers.token as string;

    if (!token) {
      throw new BadRequestException('Token not provided');
    }

    //decode token to JSON
    const payload = await this.cypher.decrypt(
      token,
      this.config.get(CONFIG.RECOVERY_SECRET_KEY),
    );

    let data: RecoveryPasswordDto;

    try {
      // JSON to object
      data = JSON.parse(payload);

      // Validate object  structure
      await validateOrReject(data);
    } catch (e) {
      this.logger.log('Invalid token: ' + e.message);

      throw new UnprocessableEntityException('Invalid token');
    }

    const currentDate = new Date().getTime();

    if (currentDate > data.expTime) {
      throw new UnauthorizedException('Your request has expired');
    }

    // populate auth info
    requestRef.authInfo = data;

    return true;
  }
}
