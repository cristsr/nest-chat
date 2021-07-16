import { AuthGuard } from '@nestjs/passport';
import {
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

export class LocalGuard extends AuthGuard('local') {
  private readonly logger = new Logger(LocalGuard.name);

  /**
   * Validate if email and password was provided
   * and call passport local strategy
   * @param context
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const body = context.switchToHttp().getRequest().body;

    if (!body.email) {
      this.logger.error('Email not provided');
      throw new UnauthorizedException('Email not provided');
    }

    if (!body.password) {
      this.logger.error('Password not provided');
      throw new UnauthorizedException('Password not provided');
    }

    this.logger.log('Credentials validation successfully');

    return super.canActivate(context);
  }
}
